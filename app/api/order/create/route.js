// //test biến thể
// import connectDB from "@/config/db";
// import Product from "@/models/Product";
// import User from "@/models/User";
// import Promo from "@/models/Promo";
// import Order from "@/models/Order";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import { inngest } from "@/config/inngest";
// import Variant from "@/models/Variants";

// export async function POST(request) {
//   try {
//     await connectDB();

//     const { userId } = getAuth(request);
//     const { address, items, promoCode, trackingCode } = await request.json();

//     console.log(`Received order request for user ${userId} at ${Date.now()}`);
//     console.log("Request data:", { address, items, promoCode, trackingCode });

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     if (!address || !items || items.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid data" },
//         { status: 400 }
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(address)) {
//       return NextResponse.json(
//         { success: false, message: `Invalid address ID: ${address}` },
//         { status: 400 }
//       );
//     }

//     if (!trackingCode) {
//       return NextResponse.json(
//         { success: false, message: "Tracking code is required" },
//         { status: 400 }
//       );
//     }

//     let subtotal = 0;
//     const updatedItems = [];

//     for (const item of items) {
//       const productId = item.product;
//       const variantId = item.variantId;

//       if (!mongoose.Types.ObjectId.isValid(productId)) {
//         return NextResponse.json(
//           { success: false, message: `Invalid product ID: ${productId}` },
//           { status: 400 }
//         );
//       }

//       const product = await Product.findById(productId);
//       if (!product) {
//         return NextResponse.json(
//           { success: false, message: `Product with ID ${productId} not found` },
//           { status: 404 }
//         );
//       }

//       if (!mongoose.Types.ObjectId.isValid(variantId)) {
//         return NextResponse.json(
//           { success: false, message: `Invalid variant ID: ${variantId}` },
//           { status: 400 }
//         );
//       }

//       const variant = await Variant.findById(variantId);
//       if (!variant || variant.productId.toString() !== productId) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: `Variant with ID ${variantId} not found or not associated with product ${productId}`,
//           },
//           { status: 400 }
//         );
//       }

//       if (variant.stock < item.quantity) {
//         return NextResponse.json({
//           success: false,
//           message: `Not enough stock for variant ${variant.attributeRefs
//             .map((ref) => ref.value)
//             .join(", ")}. Available: ${variant.stock}`,
//         });
//       }

//       subtotal += variant.offerPrice * item.quantity;
//       updatedItems.push({
//         product: new mongoose.Types.ObjectId(productId),
//         variantId: new mongoose.Types.ObjectId(variantId),
//         quantity: item.quantity,
//         brand: product.brand,
//         sku: variant.sku,
//       });
//     }

//     let calculatedDiscount = 0;
//     if (promoCode) {
//       console.log(`Looking up promo code: ${promoCode}`);
//       const promo = await Promo.findOne({
//         code: promoCode.toUpperCase(),
//         isActive: true,
//       });
//       if (!promo) {
//         console.log("Promo not found or inactive");
//         return NextResponse.json(
//           { success: false, message: "Promo code not found or inactive" },
//           { status: 400 }
//         );
//       }
//       if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
//         console.log("Promo code expired");
//         return NextResponse.json(
//           { success: false, message: "Promo code has expired" },
//           { status: 400 }
//         );
//       }
//       console.log(`Promo found:`, promo);
//       calculatedDiscount =
//         promo.discountType === "percentage"
//           ? (subtotal * promo.discount) / 100
//           : promo.discount;
//       calculatedDiscount = Math.min(calculatedDiscount, subtotal);
//       console.log(`Calculated discount: ${calculatedDiscount}`);
//     }

//     const orderDate = Date.now();
//     const tax = Math.floor(subtotal * 0.02);
//     const finalAmount = subtotal + tax - calculatedDiscount;

//     const orderId = new mongoose.Types.ObjectId();

//     // Tạo tài liệu Order trực tiếp
//     const order = await Order.create({
//       _id: orderId,
//       userId,
//       items: updatedItems,
//       amount: finalAmount,
//       address: new mongoose.Types.ObjectId(address),
//       trackingCode,
//       status: "pending",
//       date: orderDate,
//     });
//     console.log("Order created:", order); // Log để debug

//     // Gửi sự kiện qua inngest sau khi tạo order
//     await inngest.send({
//       name: "order/created",
//       id: `order-created-${orderId.toString()}`,
//       data: {
//         orderId,
//         userId,
//         address: new mongoose.Types.ObjectId(address),
//         items: updatedItems,
//         subtotal,
//         tax,
//         discount: calculatedDiscount,
//         amount: finalAmount,
//         date: orderDate,
//         trackingCode,
//       },
//     });

//     const user = await User.findById(userId);
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "User not found" },
//         { status: 404 }
//       );
//     }
//     user.cartItems = [];
//     await user.save();

//     // Cập nhật stock của variant
//     for (const item of updatedItems) {
//       const variant = await Variant.findById(item.variantId);
//       variant.stock -= item.quantity;
//       await variant.save();
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Đặt hàng thành công",
//       order: {
//         id: orderId,
//         amount: finalAmount,
//         trackingCode,
//       },
//     });
//   } catch (error) {
//     console.error("Error in /api/order/create:", error.message, error.stack);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
//app/api/order/create/route.js
import connectDB from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Promo from "@/models/Promo";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { inngest } from "@/config/inngest";
import Variant from "@/models/Variants";

export async function POST(request) {
  await connectDB();

  try {
    const { userId } = getAuth(request);
    const { address, items, promoCode, trackingCode, paymentMethod } =
      await request.json();

    console.log(`Received order request for user ${userId} at ${Date.now()}`);
    console.log("Request data:", {
      address,
      items,
      promoCode,
      trackingCode,
      paymentMethod,
    });

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(address)) {
      return NextResponse.json(
        { success: false, message: `Invalid address ID: ${address}` },
        { status: 400 }
      );
    }

    if (!trackingCode) {
      return NextResponse.json(
        { success: false, message: "Tracking code is required" },
        { status: 400 }
      );
    }

    // Kiểm tra trùng lặp trackingCode
    const existingOrder = await Order.findOne({ trackingCode });
    if (existingOrder) {
      return NextResponse.json(
        { success: false, message: "Tracking code already exists" },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const updatedItems = [];

    for (const item of items) {
      const productId = item.product;
      const variantId = item.variantId;

      if (
        !mongoose.Types.ObjectId.isValid(productId) ||
        !mongoose.Types.ObjectId.isValid(variantId)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid product ID: ${productId} or variant ID: ${variantId}`,
          },
          { status: 400 }
        );
      }

      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product with ID ${productId} not found` },
          { status: 404 }
        );
      }

      const variant = await Variant.findById(variantId);
      if (!variant || variant.productId.toString() !== productId) {
        return NextResponse.json(
          {
            success: false,
            message: `Variant with ID ${variantId} not found or not associated with product ${productId}`,
          },
          { status: 400 }
        );
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json({
          success: false,
          message: `Not enough stock for variant ${variant.attributeRefs
            .map((ref) => ref.value)
            .join(", ")}. Available: ${variant.stock}`,
        });
      }

      subtotal += variant.offerPrice * item.quantity;
      updatedItems.push({
        product: new mongoose.Types.ObjectId(productId),
        variantId: new mongoose.Types.ObjectId(variantId),
        quantity: item.quantity,
        brand: product.brand,
        sku: variant.sku,
      });
    }

    let calculatedDiscount = 0;
    if (promoCode) {
      const promo = await Promo.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
      });
      if (!promo) {
        return NextResponse.json(
          { success: false, message: "Promo code not found or inactive" },
          { status: 400 }
        );
      }
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        return NextResponse.json(
          { success: false, message: "Promo code has expired" },
          { status: 400 }
        );
      }
      calculatedDiscount =
        promo.discountType === "percentage"
          ? (subtotal * promo.discount) / 100
          : promo.discount;
      calculatedDiscount = Math.min(calculatedDiscount, subtotal);
    }

    const orderDate = Date.now();
    const tax = Math.floor(subtotal * 0.02);
    const finalAmount = subtotal + tax - calculatedDiscount;

    const orderId = new mongoose.Types.ObjectId();

    const order = await Order.create({
      _id: orderId,
      userId,
      items: updatedItems,
      amount: finalAmount,
      address: new mongoose.Types.ObjectId(address),
      trackingCode,
      status: "pending",
      date: orderDate,
    });

    await inngest.send({
      name: "order/created",
      id: `order-created-${orderId.toString()}`,
      data: {
        orderId,
        userId,
        address: new mongoose.Types.ObjectId(address),
        items: updatedItems,
        subtotal,
        tax,
        discount: calculatedDiscount,
        amount: finalAmount,
        date: orderDate,
        trackingCode,
      },
    });

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    user.cartItems = [];
    await user.save();

    // Cập nhật stock bằng bulk update
    const bulkOps = updatedItems.map((item) => ({
      updateOne: {
        filter: { _id: item.variantId },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    await Variant.bulkWrite(bulkOps);

    // Tích hợp VNPAY nếu chọn thanh toán online
    let vnpayUrl = null;
    if (paymentMethod === "vnpay") {
      const vnp_TmnCode = process.env.VNP_TMN_CODE;
      const vnp_HashSecret = process.env.VNP_HASH_SECRET;
      const vnp_Url =
        process.env.VNP_URL ||
        "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
      const vnp_ReturnUrl =
        process.env.VNP_RETURN_URL ||
        "https://techtrend-vip.vercel.app/order/return";

      const data = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode,
        vnp_Amount: finalAmount * 100, // Đơn vị nhỏ nhất
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId.toString(),
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: "other",
        vnp_Locale: "vn",
        vnp_ReturnUrl,
        vnp_IpAddr: req.headers.get("x-forwarded-for") || "127.0.0.1",
        vnp_CreateDate: new Date()
          .toISOString()
          .replace(/[-:]/g, "")
          .replace("T", "")
          .slice(0, 14),
      };

      const sortedKeys = Object.keys(data)
        .filter((key) => data[key] !== undefined && data[key] !== "")
        .sort();
      let signData = sortedKeys
        .map(
          (key) =>
            `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`
        )
        .join("&");
      const secureHash = crypto
        .createHash("sha256")
        .update(signData + vnp_HashSecret, "utf8")
        .digest("hex");
      data.vnp_SecureHash = secureHash;

      const response = await fetch(vnp_Url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      });

      if (!response.ok) {
        throw new Error(`Failed to connect to VNPAY: ${response.statusText}`);
      }

      vnpayUrl = response.url;
    }

    return NextResponse.json({
      success: true,
      message: "Đặt hàng thành công",
      order: {
        id: orderId,
        amount: finalAmount,
        trackingCode,
        vnpayUrl, // Trả về URL thanh toán nếu có
      },
    });
  } catch (error) {
    console.error("Error in /api/order/create:", {
      message: error.message,
      stack: error.stack,
      details: error.details || "No additional details",
    });
    return NextResponse.json(
      { success: false, message: "Lỗi server, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
}
