// import connectDB from "@/config/db";
// import authSeller from "@/lib/authSeller";
// import Address from "@/models/Address";
// import Order from "@/models/Order";
// import Product from "@/models/Product";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);
//     console.log("User ID:", userId);

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     const isSeller = await authSeller(userId);
//     console.log("Is Seller:", isSeller);

//     if (!isSeller) {
//       return NextResponse.json(
//         { success: false, message: "Not authorized" },
//         { status: 403 }
//       );
//     }

//     await connectDB();
//     console.log("Database connected");

//     // Lấy tất cả địa chỉ (nếu cần)
//     const addresses = await Address.find();
//     console.log("Addresses:", addresses);

//     // Lấy danh sách sản phẩm của seller (dùng userId thay vì sellerId)
//     const sellerProducts = await Product.find({ userId: userId }); // Sửa ở đây
//     const productIds = sellerProducts.map((p) => p._id);
//     console.log("Seller Product IDs:", productIds);

//     // Lấy đơn hàng chứa sản phẩm của seller
//     const orders = await Order.find({ "items.product": { $in: productIds } })
//       .populate("address")
//       .populate("items.product")
//       .exec();
//     console.log("Orders:", orders);

//     return NextResponse.json({ success: true, orders });
//   } catch (error) {
//     console.error("Error in /api/order/seller-orders:", error);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);
//     console.log("Current Seller ID:", userId);

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     const isSeller = await authSeller(userId);
//     console.log("Is Seller:", isSeller);

//     if (!isSeller) {
//       return NextResponse.json(
//         { success: false, message: "Not authorized" },
//         { status: 403 }
//       );
//     }

//     await connectDB();
//     console.log("Database connected");

//     // Lấy danh sách sản phẩm của seller
//     const sellerProducts = await Product.find({ userId: userId });
//     const productIds = sellerProducts.map((p) => p._id.toString());
//     console.log("Seller Product IDs:", productIds);

//     // Lọc đơn hàng chứa sản phẩm của seller
//     const ordersFromDB = await Order.find({
//       "items.product": { $in: productIds },
//     })
//       .populate("address")
//       .populate("items.product")
//       .exec();
//     console.log("Orders from DB:", ordersFromDB);

//     return NextResponse.json({ success: true, orders: ordersFromDB });
//   } catch (error) {
//     console.error(
//       "Error in /api/order/seller-orders:",
//       error.message,
//       error.stack
//     );
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    console.log("Current Seller ID:", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);
    console.log("Is Seller:", isSeller);

    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    await connectDB();
    console.log("Database connected");

    await Address.findOne(); // Force load model

    const sellerProducts = await Product.find({ userId: userId });
    const productIds = sellerProducts.map((p) => p._id.toString());
    console.log("Seller Product IDs:", productIds);

    const ordersFromDB = await Order.find({
      "items.product": { $in: productIds },
    })
      .populate("address")
      .populate("items.product")
      .exec();
    console.log("Orders from DB (raw):", ordersFromDB);

    // Loại bỏ các bản ghi trùng lặp dựa trên _id
    const uniqueOrders = Array.from(
      new Map(
        ordersFromDB.map((order) => [order._id.toString(), order])
      ).values()
    );
    console.log("Unique Orders:", uniqueOrders);

    return NextResponse.json({ success: true, orders: uniqueOrders });
  } catch (error) {
    console.error(
      "Error in /api/order/seller-orders:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
