// import connectDB from "@/config/db";
// import Product from "@/models/Product";
// import User from "@/models/User";
// import Promo from "@/models/Promo";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import { inngest } from "@/config/inngest";

// export async function POST(request) {
//   try {
//     await connectDB();

//     const { userId } = getAuth(request);
//     const {
//       address,
//       items,
//       promoCode,
//       discount: frontendDiscount,
//     } = await request.json();

//     console.log(`Received order request for user ${userId} at ${Date.now()}`);
//     console.log("Request data:", {
//       address,
//       items,
//       promoCode,
//       frontendDiscount,
//     });

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

//     let subtotal = 0;
//     const updatedItems = [];

//     for (const item of items) {
//       if (!mongoose.Types.ObjectId.isValid(item.product)) {
//         return NextResponse.json(
//           { success: false, message: `Invalid product ID: ${item.product}` },
//           { status: 400 }
//         );
//       }

//       const product = await Product.findById(item.product);
//       if (!product) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: `Product with ID ${item.product} not found`,
//           },
//           { status: 404 }
//         );
//       }

//       if (product.stock < item.quantity) {
//         return NextResponse.json({
//           success: false,
//           message: `Not enough stock for product ${product.name}. Available: ${product.stock}`,
//         });
//       }

//       subtotal += product.offerPrice * item.quantity;
//       console.log(`Subtotal for ${product.name}: ${subtotal}`); // Debug subtotal

//       updatedItems.push({
//         product: new mongoose.Types.ObjectId(item.product),
//         quantity: item.quantity,
//         brand: product.brand,
//       });
//     }

//     // Tra cứu và tính toán discount
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
//     } else if (frontendDiscount && !promoCode) {
//       // Chỉ dùng frontendDiscount nếu không có promoCode
//       console.log(`Using frontend discount: ${frontendDiscount}`);
//       calculatedDiscount = frontendDiscount;
//     }

//     const orderDate = Date.now();
//     const tax = Math.floor(subtotal * 0.02);
//     const finalAmount = subtotal + tax - calculatedDiscount;

//     const orderId = new mongoose.Types.ObjectId();

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

//     return NextResponse.json({
//       success: true,
//       message: "Đặt Hàng",
//       order: {
//         id: orderId,
//         amount: finalAmount,
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
import connectDB from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Promo from "@/models/Promo";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { inngest } from "@/config/inngest";

export async function POST(request) {
  try {
    await connectDB();

    const { userId } = getAuth(request);
    const {
      address,
      items,
      promoCode,
      discount: frontendDiscount,
      trackingCode, // Thêm trackingCode từ GHTK
    } = await request.json();

    console.log(`Received order request for user ${userId} at ${Date.now()}`);
    console.log("Request data:", {
      address,
      items,
      promoCode,
      frontendDiscount,
      trackingCode,
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

    let subtotal = 0;
    const updatedItems = [];

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return NextResponse.json(
          { success: false, message: `Invalid product ID: ${item.product}` },
          { status: 400 }
        );
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product with ID ${item.product} not found`,
          },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({
          success: false,
          message: `Not enough stock for product ${product.name}. Available: ${product.stock}`,
        });
      }

      subtotal += product.offerPrice * item.quantity;
      updatedItems.push({
        product: new mongoose.Types.ObjectId(item.product),
        quantity: item.quantity,
        brand: product.brand,
      });
    }

    let calculatedDiscount = 0;
    if (promoCode) {
      console.log(`Looking up promo code: ${promoCode}`);
      const promo = await Promo.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
      });
      if (!promo) {
        console.log("Promo not found or inactive");
        return NextResponse.json(
          { success: false, message: "Promo code not found or inactive" },
          { status: 400 }
        );
      }
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        console.log("Promo code expired");
        return NextResponse.json(
          { success: false, message: "Promo code has expired" },
          { status: 400 }
        );
      }
      console.log(`Promo found:`, promo);
      calculatedDiscount =
        promo.discountType === "percentage"
          ? (subtotal * promo.discount) / 100
          : promo.discount;
      calculatedDiscount = Math.min(calculatedDiscount, subtotal);
      console.log(`Calculated discount: ${calculatedDiscount}`);
    } else if (frontendDiscount && !promoCode) {
      console.log(`Using frontend discount: ${frontendDiscount}`);
      calculatedDiscount = frontendDiscount;
    }

    const orderDate = Date.now();
    const tax = Math.floor(subtotal * 0.02);
    const finalAmount = subtotal + tax - calculatedDiscount;

    const orderId = new mongoose.Types.ObjectId();

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
        trackingCode, // Thêm trackingCode vào Inngest
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

    return NextResponse.json({
      success: true,
      message: "Đặt Hàng",
      order: {
        id: orderId,
        amount: finalAmount,
        trackingCode,
      },
    });
  } catch (error) {
    console.error("Error in /api/order/create:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
