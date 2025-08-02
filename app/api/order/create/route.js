import connectDB from "@/config/db";
import Product from "@/models/Product";
import Promo from "@/models/Promo";
import Order from "@/models/Order";
import Variant from "@/models/Variants";
import Address from "@/models/Address";
import Specification from "@/models/Specification";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import crypto from "crypto";
import moment from "moment-timezone";
import { inngest } from "@/config/inngest";
import { sendInngestEvent } from "@/lib/inngestHelper";
import axios from "axios";

const generateTrackingCode = () =>
  `TEMP-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

export async function POST(request) {
  await connectDB();

  try {
    const { userId } = getAuth(request);
    const { address, items, promoCode, paymentMethod, amount, shippingFee } =
      await request.json();

    console.log("📥 Received payload:", {
      address,
      items,
      promoCode,
      paymentMethod,
      amount,
      shippingFee,
    });

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    if (!address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Dữ liệu đơn hàng không hợp lệ" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(address)) {
      return NextResponse.json(
        { success: false, message: "Địa chỉ không hợp lệ" },
        { status: 400 }
      );
    }

    const fullAddress = await Address.findById(address);
    if (!fullAddress) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy địa chỉ" },
        { status: 404 }
      );
    }

    const productIds = items.map((item) => item.product);
    const variantIds = items.map((item) => item.variantId);
    const products = await Product.find({ _id: { $in: productIds } }).populate(
      "specifications"
    );
    const variants = await Variant.find({ _id: { $in: variantIds } });

    let subtotal = 0;
    const updatedItems = [];

    // Giảm stock và chuẩn bị items
    for (const item of items) {
      const { product, variantId, quantity } = item;

      if (
        !mongoose.Types.ObjectId.isValid(product) ||
        !mongoose.Types.ObjectId.isValid(variantId) ||
        quantity <= 0
      ) {
        return NextResponse.json(
          { success: false, message: "Sản phẩm không hợp lệ" },
          { status: 400 }
        );
      }

      const foundProduct = products.find((p) => p._id.equals(product));
      const foundVariant = variants.find((v) => v._id.equals(variantId));

      if (!foundProduct || !foundVariant) {
        return NextResponse.json(
          { success: false, message: "Không tìm thấy sản phẩm/phiên bản" },
          { status: 404 }
        );
      }

      if (foundVariant.stock < quantity) {
        return NextResponse.json(
          { success: false, message: "Phiên bản không đủ hàng" },
          { status: 400 }
        );
      }

      // Giảm stock ngay khi đặt hàng
      foundVariant.stock -= quantity;
      await foundVariant.save();

      const weightSpec =
        foundProduct.specifications
          .find((spec) => spec.key === "Trọng lượng")
          ?.value?.trim() || "50g";
      let weight = 50;
      if (weightSpec.toLowerCase().includes("kg")) {
        const kgValue = parseFloat(
          weightSpec.toLowerCase().replace("kg", "").trim()
        );
        weight = Math.max(10, Math.round(kgValue * 1000));
      } else if (weightSpec.toLowerCase().includes("g")) {
        const gValue = parseFloat(
          weightSpec.toLowerCase().replace("g", "").trim()
        );
        weight = Math.max(10, Math.round(gValue));
      } else {
        const rawValue = parseFloat(weightSpec);
        weight = isNaN(rawValue) ? 50 : Math.max(10, Math.round(rawValue));
      }

      subtotal += foundVariant.offerPrice * quantity;
      updatedItems.push({
        product: new mongoose.Types.ObjectId(product),
        variantId: new mongoose.Types.ObjectId(variantId),
        quantity,
        brand: foundProduct.brand,
        sku: foundVariant.sku,
        weight,
        offerPrice: foundVariant.offerPrice,
      });
    }

    console.log("Debug subtotal:", subtotal);
    console.log("Debug updatedItems:", updatedItems);

    let calculatedDiscount = 0;
    let promoInfo = null;

    console.log("🎯 Received promoCode:", {
      promoCode,
      type: typeof promoCode,
    });

    if (promoCode && promoCode.trim() !== "") {
      console.log("🔍 Looking for promo:", promoCode.toUpperCase());

      const promo = await Promo.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
      });

      console.log("📦 Found promo:", promo);

      if (
        !promo ||
        (promo.expiresAt && new Date(promo.expiresAt) < new Date()) ||
        (promo.maxUses && promo.usedCount >= promo.maxUses)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Mã giảm giá không hợp lệ, đã hết hạn hoặc đã hết lượt sử dụng",
          },
          { status: 400 }
        );
      }
      calculatedDiscount =
        promo.discountType === "percentage"
          ? (subtotal * promo.discount) / 100
          : promo.discount;
      calculatedDiscount = Math.min(calculatedDiscount, subtotal);

      // Lưu thông tin promo để thêm vào order
      promoInfo = {
        code: promo.code,
        discount: calculatedDiscount,
        type: promo.discountType,
      };

      console.log("✅ PromoInfo created:", promoInfo);
    }

    const tax = Math.floor(subtotal * 0.02);
    const finalAmount =
      amount || Math.max(0, Math.floor(subtotal + tax - calculatedDiscount));

    const orderDate = new Date();
    const tempTrackingCode = generateTrackingCode();

    console.log("🎯 Creating order with promo info:", {
      promoCode,
      promoInfo,
      calculatedDiscount,
    });

    const order = await Order.create({
      userId,
      items: updatedItems,
      amount: finalAmount,
      address: new mongoose.Types.ObjectId(address),
      shippingFee: shippingFee || 0,
      trackingCode: tempTrackingCode,
      status: "pending", // Đặt hàng ban đầu là pending
      paymentMethod: paymentMethod || "COD",
      date: orderDate,
      // Thêm thông tin promo nếu có
      ...(promoInfo && {
        promoCode: promoInfo.code,
        promoDiscount: promoInfo.discount,
        promoType: promoInfo.type,
      }),
    });

    console.log("✅ Order created with data:", {
      orderId: order._id,
      promoCode: order.promoCode,
      promoDiscount: order.promoDiscount,
      promoType: order.promoType,
    });

    // Tăng usedCount của promo NGAY SAU KHI TẠO ORDER THÀNH CÔNG
    if (promoCode && promoInfo) {
      await Promo.findOneAndUpdate(
        { code: promoCode.toUpperCase() },
        { $inc: { usedCount: 1 } },
        { new: true }
      );
      console.log(`📊 Increased usedCount for promo: ${promoCode}`);
    }

    const orderId = order._id;

    // Xử lý khác nhau cho COD và VNPay
    if (paymentMethod === "cod") {
      // Với COD: đợi Inngest hoàn thành hoặc fallback thành công
      const fallbackCallback = async () => {
        try {
          await processGHNOrder(
            orderId,
            tempTrackingCode,
            updatedItems,
            fullAddress,
            finalAmount
          );
          console.log("✅ Fallback GHN processing successful");
        } catch (error) {
          console.error("❌ Fallback GHN processing failed:", error.message);
          await Order.findByIdAndUpdate(orderId, {
            status: "ghn_failed",
            ghnError: error.message,
          });
          throw new Error(`GHN processing failed: ${error.message}`);
        }
      };

      const inngestResult = await sendInngestEvent(
        "order/created",
        `order-created-${orderId}`,
        {
          orderId,
          userId,
          address,
          items: updatedItems,
          subtotal,
          tax,
          discount: calculatedDiscount,
          amount: finalAmount,
          shippingFee: shippingFee || 0,
          trackingCode: tempTrackingCode,
          date: orderDate,
          paymentMethod,
        },
        {
          maxRetries: 2,
          timeout: 3000,
          fallbackCallback,
        }
      );

      // Nếu cả Inngest và fallback đều fail thì throw error
      if (!inngestResult.success) {
        throw new Error("Không thể xử lý đơn hàng. Vui lòng thử lại.");
      }

      // COD success - trả về response
      return NextResponse.json({
        success: true,
        message: "Đơn hàng đã được tạo thành công",
        id: order._id,
        amount: finalAmount,
        trackingCode: tempTrackingCode,
      });
    } else {
      // Với VNPay: gửi Inngest async, không đợi
      sendInngestEvent(
        "order/created",
        `order-created-${orderId}`,
        {
          orderId,
          userId,
          address,
          items: updatedItems,
          subtotal,
          tax,
          discount: calculatedDiscount,
          amount: finalAmount,
          shippingFee: shippingFee || 0,
          trackingCode: tempTrackingCode,
          date: orderDate,
          paymentMethod,
        },
        {
          maxRetries: 2,
          timeout: 3000,
        }
      ).catch((error) => {
        console.error("❌ VNPay Inngest failed, but continuing:", error);
      });

      // VNPay: tạo URL thanh toán
      const vnp_TmnCode = process.env.VNP_TMN_CODE;
      const vnp_HashSecret = process.env.VNP_HASH_SECRET;
      const vnp_Url = process.env.VNP_URL;
      const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

      if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url || !vnp_ReturnUrl) {
        return NextResponse.json(
          { success: false, message: "Thiếu cấu hình VNPAY trong .env" },
          { status: 500 }
        );
      }

      const now = moment().tz("Asia/Ho_Chi_Minh");
      const vnp_CreateDate = now.format("YYYYMMDDHHmmss");
      const vnp_ExpireDate = now
        .clone()
        .add(15, "minutes")
        .format("YYYYMMDDHHmmss");

      const vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: tempTrackingCode,
        vnp_OrderInfo: "Thanh toán đơn hàng từ QuickCart",
        vnp_OrderType: "other",
        vnp_Amount: finalAmount * 100,
        vnp_ReturnUrl,
        vnp_IpAddr: request.headers.get("x-forwarded-for") || "127.0.0.1",
        vnp_CreateDate,
        vnp_ExpireDate,
      };

      const encode = (str) => encodeURIComponent(str).replace(/%20/g, "+");
      const sortedKeys = Object.keys(vnp_Params).sort();
      const signData = sortedKeys
        .map((key) => `${encode(key)}=${encode(vnp_Params[key])}`)
        .join("&");

      const secureHash = crypto
        .createHmac("sha512", vnp_HashSecret)
        .update(signData, "utf8")
        .digest("hex");
      vnp_Params.vnp_SecureHash = secureHash;

      const vnpayUrl = `${vnp_Url}?${sortedKeys
        .map((key) => `${encode(key)}=${encode(vnp_Params[key])}`)
        .join("&")}&vnp_SecureHash=${secureHash}`;

      return NextResponse.json({
        success: true,
        message: "Đặt hàng thành công",
        order: {
          id: order._id,
          amount: finalAmount,
          trackingCode: tempTrackingCode,
          vnpayUrl,
        },
      });
    }
  } catch (error) {
    console.error("❌ Order creation error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

// Hàm xử lý GHN order riêng biệt để không block response - Export để có thể dùng từ helper
export async function processGHNOrder(
  orderId,
  trackingCode,
  items,
  address,
  amount
) {
  try {
    const totalWeight = items.reduce(
      (sum, item) => sum + item.weight * item.quantity,
      0
    );

    const ghnPayload = {
      payment_type_id: 2,
      note: "Giao hàng QuickCart",
      required_note: "KHONGCHOXEMHANG",
      return_phone: "0911222333",
      return_address: "590 CMT8, P.11, Q.3, TP. HCM",
      return_district_id: null,
      return_ward_code: "",
      client_order_code: trackingCode,
      to_name: address.fullName,
      to_phone: address.phoneNumber,
      to_address: address.area,
      to_ward_code: address.wardCode,
      to_district_id: address.districtId,
      cod_amount: Math.round(amount),
      weight: Math.max(Math.round(totalWeight), 50), // Đảm bảo weight là số nguyên
      service_type_id: 2,
      items: items.map((item) => ({
        name: item.sku,
        quantity: item.quantity,
        price: Math.round(item.offerPrice), // Đảm bảo price là số nguyên
        weight: Math.max(Math.round(item.weight), 50), // Đảm bảo item weight là số nguyên
      })),
    };

    console.log(
      "📤 Fallback GHN createOrder payload:",
      JSON.stringify(ghnPayload, null, 2)
    );

    const ghnRes = await axios.post(process.env.GHN_API_URL, ghnPayload, {
      headers: {
        "Content-Type": "application/json",
        Token: process.env.GHN_TOKEN,
        ShopId: process.env.GHN_SHOP_ID,
      },
      timeout: 15000,
    });

    const ghnData = ghnRes.data;
    console.log("📦 Fallback GHN createOrder response:", ghnData);

    if (ghnData.code === 200) {
      const newTrackingCode = ghnData.data.order_code;
      await Order.findByIdAndUpdate(orderId, {
        status: "Chờ lấy hàng",
        ghnOrderId: ghnData.data.order_id,
        trackingCode: newTrackingCode,
      });
      console.log(
        "✅ Fallback GHN createOrder success, updated trackingCode:",
        newTrackingCode
      );
    } else {
      throw new Error(
        `GHN failed with code ${ghnData.code}: ${ghnData.message}`
      );
    }
  } catch (error) {
    console.error("❌ Fallback GHN API error:", error.message);
    throw error;
  }
}
