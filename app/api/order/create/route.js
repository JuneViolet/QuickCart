//bản chạy được vnpay và tạo được đơn hàng order
// import connectDB from "@/config/db";
// import Product from "@/models/Product";
// import Promo from "@/models/Promo";
// import Order from "@/models/Order";
// import Variant from "@/models/Variants";
// import Address from "@/models/Address";
// import Specification from "@/models/Specification";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import crypto from "crypto";
// import moment from "moment-timezone";
// import { inngest } from "@/config/inngest";

// export async function POST(request) {
//   await connectDB();

//   try {
//     const { userId } = getAuth(request);
//     const { address, items, promoCode, trackingCode, paymentMethod } =
//       await request.json();

//     console.log("📥 Received payload:", {
//       address,
//       items,
//       promoCode,
//       trackingCode,
//       paymentMethod,
//     });

//     if (!userId) {
//       console.log("❌ Error: Chưa đăng nhập");
//       return NextResponse.json(
//         { success: false, message: "Chưa đăng nhập" },
//         { status: 401 }
//       );
//     }

//     if (
//       !trackingCode ||
//       !address ||
//       !items ||
//       !Array.isArray(items) ||
//       items.length === 0
//     ) {
//       console.log("❌ Error: Dữ liệu đơn hàng không hợp lệ", {
//         trackingCode,
//         address,
//         items,
//       });
//       return NextResponse.json(
//         { success: false, message: "Dữ liệu đơn hàng không hợp lệ" },
//         { status: 400 }
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(address)) {
//       console.log("❌ Error: Địa chỉ không hợp lệ", { address });
//       return NextResponse.json(
//         { success: false, message: "Địa chỉ không hợp lệ" },
//         { status: 400 }
//       );
//     }

//     const existing = await Order.findOne({ trackingCode });
//     if (existing) {
//       console.log("❌ Error: Mã đơn hàng đã tồn tại", { trackingCode });
//       return NextResponse.json(
//         { success: false, message: "Mã đơn hàng đã tồn tại" },
//         { status: 400 }
//       );
//     }

//     const fullAddress = await Address.findById(address);
//     if (!fullAddress) {
//       console.log("❌ Error: Không tìm thấy địa chỉ", { address });
//       return NextResponse.json(
//         { success: false, message: "Không tìm thấy địa chỉ" },
//         { status: 404 }
//       );
//     }

//     let subtotal = 0;
//     const updatedItems = [];

//     for (const item of items) {
//       const { product, variantId, quantity } = item;

//       if (
//         !mongoose.Types.ObjectId.isValid(product) ||
//         !mongoose.Types.ObjectId.isValid(variantId) ||
//         quantity <= 0
//       ) {
//         console.log("❌ Error: Sản phẩm không hợp lệ", {
//           product,
//           variantId,
//           quantity,
//         });
//         return NextResponse.json(
//           { success: false, message: "Sản phẩm không hợp lệ" },
//           { status: 400 }
//         );
//       }

//       const foundProduct = await Product.findById(product).populate(
//         "specifications"
//       );
//       const foundVariant = await Variant.findById(variantId);

//       if (!foundProduct || !foundVariant) {
//         console.log("❌ Error: Không tìm thấy sản phẩm/phiên bản", {
//           product,
//           variantId,
//         });
//         return NextResponse.json(
//           { success: false, message: "Không tìm thấy sản phẩm/phiên bản" },
//           { status: 404 }
//         );
//       }

//       if (foundVariant.stock < quantity) {
//         console.log("❌ Error: Phiên bản không đủ hàng", {
//           variantId,
//           stock: foundVariant.stock,
//           quantity,
//         });
//         return NextResponse.json(
//           { success: false, message: "Phiên bản không đủ hàng" },
//           { status: 400 }
//         );
//       }

//       const weightSpec =
//         foundProduct.specifications
//           .find((spec) => spec.key === "Trọng lượng")
//           ?.value?.trim() || "50g";

//       let weight = 50;
//       if (weightSpec.toLowerCase().includes("kg")) {
//         const kgValue = parseFloat(
//           weightSpec.toLowerCase().replace("kg", "").trim()
//         );
//         weight = Math.max(10, Math.round(kgValue * 1000)); // Chuyển từ kg sang gram, tối thiểu 10g
//       } else if (weightSpec.toLowerCase().includes("g")) {
//         const gValue = parseFloat(
//           weightSpec.toLowerCase().replace("g", "").trim()
//         );
//         weight = Math.max(10, Math.round(gValue)); // Làm tròn gram, tối thiểu 10g
//       } else {
//         const rawValue = parseFloat(weightSpec);
//         weight = isNaN(rawValue) ? 50 : Math.max(10, Math.round(rawValue));
//       }

//       subtotal += foundVariant.offerPrice * quantity;
//       updatedItems.push({
//         product: new mongoose.Types.ObjectId(product),
//         variantId: new mongoose.Types.ObjectId(variantId),
//         quantity,
//         brand: foundProduct.brand,
//         sku: foundVariant.sku,
//         weight,
//         offerPrice: foundVariant.offerPrice,
//       });
//     }

//     console.log("Debug subtotal:", subtotal);
//     console.log("Debug updatedItems:", updatedItems);

//     let calculatedDiscount = 0;
//     if (promoCode) {
//       const promo = await Promo.findOne({
//         code: promoCode.toUpperCase(),
//         isActive: true,
//       });

//       if (
//         !promo ||
//         (promo.expiresAt && new Date(promo.expiresAt) < new Date())
//       ) {
//         console.log("❌ Error: Mã giảm giá không hợp lệ hoặc đã hết hạn", {
//           promoCode,
//         });
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Mã giảm giá không hợp lệ hoặc đã hết hạn",
//           },
//           { status: 400 }
//         );
//       }

//       calculatedDiscount =
//         promo.discountType === "percentage"
//           ? (subtotal * promo.discount) / 100
//           : promo.discount;
//       calculatedDiscount = Math.min(calculatedDiscount, subtotal);
//     }

//     const tax = Math.floor(subtotal * 0.02);
//     const finalAmount = Math.max(
//       0,
//       Math.floor(subtotal + tax - calculatedDiscount)
//     );
//     const orderDate = new Date();

//     const order = await Order.create({
//       userId,
//       items: updatedItems,
//       amount: finalAmount,
//       address: new mongoose.Types.ObjectId(address),
//       trackingCode,
//       status: "pending",
//       date: orderDate,
//     });

//     const orderId = order._id;

//     await inngest.send({
//       name: "order/created",
//       id: `order-created-${orderId}`,
//       data: {
//         orderId,
//         userId,
//         address,
//         items: updatedItems,
//         subtotal,
//         tax,
//         discount: calculatedDiscount,
//         amount: finalAmount,
//         trackingCode,
//         date: orderDate,
//       },
//     });

//     if (paymentMethod === "cod") {
//       const bulkOps = updatedItems.map((item) => ({
//         updateOne: {
//           filter: { _id: item.variantId },
//           update: { $inc: { stock: -item.quantity } },
//         },
//       }));
//       await Variant.bulkWrite(bulkOps);

//       const totalWeight = updatedItems.reduce(
//         (sum, item) => sum + item.weight * item.quantity,
//         0
//       );

//       const currentTime = moment().tz("Asia/Ho_Chi_Minh");
//       const pickupTime = currentTime
//         .clone()
//         .add(1, "day")
//         .set({ hour: 8, minute: 0, second: 0 })
//         .format("YYYY-MM-DD HH:mm:ss"); // 8:00 AM ngày tiếp theo
//       const orderDateStr = currentTime.format("YYYY-MM-DD HH:mm:ss");

//       const ghtkPayload = {
//         id: trackingCode,
//         pick_name: "QuickCart Shop",
//         pick_address: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
//         pick_province: "TP. Hồ Chí Minh",
//         pick_district: "Quận 1",
//         pick_ward: "Phường Bến Nghé",
//         pick_tel: "0564873090",
//         name: fullAddress.fullName,
//         address: fullAddress.area,
//         province: fullAddress.city,
//         district: fullAddress.state,
//         ward: fullAddress.ward,
//         tel: fullAddress.phoneNumber,
//         is_freeship: "0",
//         pick_option: "cod",
//         note: "Giao hàng nhanh",
//         transport: "road",
//         value: finalAmount,
//         pick_money: finalAmount,
//         weight: totalWeight,
//         products: updatedItems.map((item) => ({
//           name: item.sku,
//           weight: item.weight,
//           quantity: item.quantity,
//           product_code: item.sku,
//         })),
//         service_type_id: 1, // Cần xác minh với GHTK
//         deliver_option: "none", // Thêm để chỉ định dịch vụ chuẩn
//         pickup_time: pickupTime,
//         order_date: orderDateStr,
//       };

//       console.log(
//         "📤 GHTK createOrder payload:",
//         JSON.stringify(ghtkPayload, null, 2)
//       );
//       try {
//         const ghtkRes = await fetch(
//           `${process.env.GHTK_API_URL}/services/shipment/order`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Token: process.env.GHTK_API_TOKEN,
//             },
//             body: JSON.stringify(ghtkPayload),
//           }
//         );

//         const ghtkData = await ghtkRes.json();
//         if (!ghtkData.success) {
//           console.error("❌ GHTK createOrder failed:", ghtkData.message);
//           await Order.findByIdAndUpdate(orderId, { status: "ghtk_failed" });
//         } else {
//           console.log("📦 GHTK createOrder response:", ghtkData);
//           await Order.findByIdAndUpdate(orderId, { status: "ghtk_success" });
//         }
//       } catch (err) {
//         console.error("❌ GHTK error:", err.message);
//         await Order.findByIdAndUpdate(orderId, { status: "ghtk_failed" });
//       }
//     }

//     let vnpayUrl = null;
//     if (paymentMethod === "vnpay") {
//       const vnp_TmnCode = process.env.VNP_TMN_CODE;
//       const vnp_HashSecret = process.env.VNP_HASH_SECRET;
//       const vnp_Url = process.env.VNP_URL;
//       const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

//       if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url || !vnp_ReturnUrl) {
//         throw new Error("Thiếu cấu hình VNPAY trong .env");
//       }

//       const now = moment().tz("Asia/Ho_Chi_Minh");
//       const vnp_CreateDate = now.format("YYYYMMDDHHmmss");
//       const vnp_ExpireDate = now
//         .clone()
//         .add(15, "minutes")
//         .format("YYYYMMDDHHmmss");

//       const vnp_Params = {
//         vnp_Version: "2.1.0",
//         vnp_Command: "pay",
//         vnp_TmnCode,
//         vnp_Locale: "vn",
//         vnp_CurrCode: "VND",
//         vnp_TxnRef: trackingCode,
//         vnp_OrderInfo: "Thanh toán đơn hàng từ QuickCart",
//         vnp_OrderType: "other",
//         vnp_Amount: finalAmount * 100,
//         vnp_ReturnUrl,
//         vnp_IpAddr: request.headers.get("x-forwarded-for") || "127.0.0.1",
//         vnp_CreateDate,
//         vnp_ExpireDate,
//       };

//       const encode = (str) => encodeURIComponent(str).replace(/%20/g, "+");
//       const sortedKeys = Object.keys(vnp_Params).sort();
//       const signData = sortedKeys
//         .map((key) => `${encode(key)}=${encode(vnp_Params[key])}`)
//         .join("&");

//       const secureHash = crypto
//         .createHmac("sha512", vnp_HashSecret)
//         .update(signData, "utf8")
//         .digest("hex");
//       vnp_Params.vnp_SecureHash = secureHash;

//       vnpayUrl = `${vnp_Url}?${sortedKeys
//         .map((key) => `${encode(key)}=${encode(vnp_Params[key])}`)
//         .join("&")}&vnp_SecureHash=${secureHash}`;
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Đặt hàng thành công",
//       order: {
//         id: order._id,
//         amount: finalAmount,
//         trackingCode,
//         vnpayUrl,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Order creation error:", error);
//     return NextResponse.json(
//       { success: false, message: "Lỗi server: " + error.message },
//       { status: 500 }
//     );
//   }
// }
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
import axios from "axios";
require("dotenv").config();

export async function POST(request) {
  await connectDB();

  try {
    const { userId } = getAuth(request);
    const { address, items, promoCode, paymentMethod } = await request.json();

    console.log("📥 Received payload:", {
      address,
      items,
      promoCode,
      paymentMethod,
    });

    if (!userId) {
      console.log("❌ Error: Chưa đăng nhập");
      return NextResponse.json(
        { success: false, message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    if (!address || !items || !Array.isArray(items) || items.length === 0) {
      console.log("❌ Error: Dữ liệu đơn hàng không hợp lệ", {
        address,
        items,
      });
      return NextResponse.json(
        { success: false, message: "Dữ liệu đơn hàng không hợp lệ" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(address)) {
      console.log("❌ Error: Địa chỉ không hợp lệ", { address });
      return NextResponse.json(
        { success: false, message: "Địa chỉ không hợp lệ" },
        { status: 400 }
      );
    }

    const fullAddress = await Address.findById(address);
    if (!fullAddress) {
      console.log("❌ Error: Không tìm thấy địa chỉ", { address });
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

    for (const item of items) {
      const { product, variantId, quantity } = item;

      if (
        !mongoose.Types.ObjectId.isValid(product) ||
        !mongoose.Types.ObjectId.isValid(variantId) ||
        quantity <= 0
      ) {
        console.log("❌ Error: Sản phẩm không hợp lệ", {
          product,
          variantId,
          quantity,
        });
        return NextResponse.json(
          { success: false, message: "Sản phẩm không hợp lệ" },
          { status: 400 }
        );
      }

      const foundProduct = products.find((p) => p._id.equals(product));
      const foundVariant = variants.find((v) => v._id.equals(variantId));

      if (!foundProduct || !foundVariant) {
        console.log("❌ Error: Không tìm thấy sản phẩm/phiên bản", {
          product,
          variantId,
        });
        return NextResponse.json(
          { success: false, message: "Không tìm thấy sản phẩm/phiên bản" },
          { status: 404 }
        );
      }

      if (foundVariant.stock < quantity) {
        console.log("❌ Error: Phiên bản không đủ hàng", {
          variantId,
          stock: foundVariant.stock,
          quantity,
        });
        return NextResponse.json(
          { success: false, message: "Phiên bản không đủ hàng" },
          { status: 400 }
        );
      }

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
    if (promoCode) {
      const promo = await Promo.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
      });

      if (
        !promo ||
        (promo.expiresAt && new Date(promo.expiresAt) < new Date())
      ) {
        console.log("❌ Error: Mã giảm giá không hợp lệ hoặc đã hết hạn", {
          promoCode,
        });
        return NextResponse.json(
          {
            success: false,
            message: "Mã giảm giá không hợp lệ hoặc đã hết hạn",
          },
          { status: 400 }
        );
      }

      calculatedDiscount =
        promo.discountType === "percentage"
          ? (subtotal * promo.discount) / 100
          : promo.discount;
      calculatedDiscount = Math.min(calculatedDiscount, subtotal);
    }

    const tax = Math.floor(subtotal * 0.02);
    const finalAmount = Math.max(
      0,
      Math.floor(subtotal + tax - calculatedDiscount)
    );
    const orderDate = new Date();
    const tempTrackingCode = `TEMP-${Date.now()}`; // Mã tạm thời

    const order = await Order.create({
      userId,
      items: updatedItems,
      amount: finalAmount,
      address: new mongoose.Types.ObjectId(address),
      trackingCode: tempTrackingCode, // Sử dụng mã tạm thời
      status: "pending",
      paymentMethod: paymentMethod || "COD", // Gán paymentMethod
      date: orderDate,
    });

    const orderId = order._id;

    await inngest.send({
      name: "order/created",
      id: `order-created-${orderId}`,
      data: {
        orderId,
        userId,
        address,
        items: updatedItems,
        subtotal,
        tax,
        discount: calculatedDiscount,
        amount: finalAmount,
        trackingCode: tempTrackingCode,
        date: orderDate,
      },
    });

    let ghnTrackingCode = null;
    if (paymentMethod === "cod") {
      const bulkOps = updatedItems.map((item) => ({
        updateOne: {
          filter: { _id: item.variantId },
          update: { $inc: { stock: -item.quantity } },
        },
      }));
      await Variant.bulkWrite(bulkOps);

      const totalWeight = updatedItems.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0
      );

      const currentTime = moment().tz("Asia/Ho_Chi_Minh");
      const pickupTime = currentTime
        .clone()
        .add(1, "day")
        .set({ hour: 8, minute: 0, second: 0 })
        .format("YYYY-MM-DD HH:mm:ss");

      const ghnPayload = {
        payment_type_id: 2, // COD
        note: "Giao hàng QuickCart",
        required_note: "KHONGCHOXEMHANG",
        return_phone: "0911222333",
        return_address: "590 CMT8, P.11, Q.3, TP. HCM",
        return_district_id: null,
        return_ward_code: "",
        client_order_code: tempTrackingCode, // Dùng mã tạm thời cho GHN
        to_name: fullAddress.fullName,
        to_phone: fullAddress.phoneNumber,
        to_address: fullAddress.area,
        to_ward_code: fullAddress.wardCode,
        to_district_id: fullAddress.districtId,
        cod_amount: Math.round(finalAmount),
        weight: Math.max(totalWeight, 50),
        service_type_id: 2, // Express
        items: updatedItems.map((item) => ({
          name: item.sku,
          quantity: item.quantity,
          price: item.offerPrice,
          weight: Math.max(item.weight, 50),
        })),
      };

      console.log(
        "📤 GHN createOrder payload:",
        JSON.stringify(ghnPayload, null, 2)
      );

      try {
        const ghnRes = await axios.post(process.env.GHN_API_URL, ghnPayload, {
          headers: {
            "Content-Type": "application/json",
            Token: process.env.GHN_TOKEN,
            ShopId: process.env.GHN_SHOP_ID,
          },
        });

        const ghnData = ghnRes.data;
        console.log("📦 GHN createOrder response:", ghnData);

        if (ghnData.code === 200) {
          ghnTrackingCode = ghnData.data.order_code;
          await Order.findByIdAndUpdate(orderId, {
            status: "ghn_success",
            ghnOrderId: ghnData.data.order_id,
            trackingCode: ghnTrackingCode, // Cập nhật bằng mã GHN
          });
          console.log("✅ GHN createOrder success:", ghnTrackingCode);
        } else {
          throw new Error(ghnData.message || "GHN request failed");
        }
      } catch (err) {
        console.error("❌ GHN API error:", err.response?.data || err.message);
        await Order.findByIdAndUpdate(orderId, {
          status: "ghn_failed",
          ghnError: err.response?.data?.message || err.message,
        });
        await Order.findByIdAndDelete(orderId); // Rollback
        return NextResponse.json(
          {
            success: false,
            message: `GHN thất bại: ${
              err.response?.data?.message || err.message
            }`,
          },
          { status: 400 }
        );
      }
    }

    let vnpayUrl = null;
    if (paymentMethod === "vnpay") {
      const vnp_TmnCode = process.env.VNP_TMN_CODE;
      const vnp_HashSecret = process.env.VNP_HASH_SECRET;
      const vnp_Url = process.env.VNP_URL;
      const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

      if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url || !vnp_ReturnUrl) {
        throw new Error("Thiếu cấu hình VNPAY trong .env");
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
        vnp_TxnRef: tempTrackingCode, // Dùng mã tạm thời cho VNPay
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

      vnpayUrl = `${vnp_Url}?${sortedKeys
        .map((key) => `${encode(key)}=${encode(vnp_Params[key])}`)
        .join("&")}&vnp_SecureHash=${secureHash}`;
    }

    return NextResponse.json({
      success: true,
      message: "Đặt hàng thành công",
      order: {
        id: order._id,
        amount: finalAmount,
        trackingCode: ghnTrackingCode || tempTrackingCode, // Trả về mã GHN nếu có, nếu không thì mã tạm
        vnpayUrl,
      },
    });
  } catch (error) {
    console.error("❌ Order creation error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}
