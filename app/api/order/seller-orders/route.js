// import connectDB from "@/config/db";
// import authSeller from "@/lib/authSeller";
// import Order from "@/models/Order";
// import Product from "@/models/Product";
// import Address from "@/models/Address";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import mongoose from "mongoose";

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

//     await Address.findOne(); // Force load model

//     const sellerProducts = await Product.find({ userId: userId });
//     const productIds = sellerProducts.map((p) => p._id.toString());
//     console.log("Seller Product IDs:", productIds);

//     const ordersFromDB = await Order.find({
//       "items.product": { $in: productIds },
//     })
//       .populate("address")
//       .populate("items.product")
//       .exec();
//     console.log("Orders from DB (raw):", ordersFromDB);

//     // Loại bỏ các bản ghi trùng lặp dựa trên _id
//     const uniqueOrders = Array.from(
//       new Map(
//         ordersFromDB.map((order) => [order._id.toString(), order])
//       ).values()
//     );
//     console.log("Unique Orders:", uniqueOrders);

//     return NextResponse.json({ success: true, orders: uniqueOrders });
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
import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import axios from "axios";

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

    const updatedOrders = await Promise.all(
      ordersFromDB.map(async (order) => {
        if (order.trackingCode) {
          try {
            const { data: ghtkData } = await axios.post("/api/ghtk", {
              action: "trackOrder",
              payload: { trackingCode: order.trackingCode },
            });
            if (ghtkData.success) {
              return { ...order.toObject(), ghtkStatus: ghtkData.data.status };
            }
          } catch (error) {
            console.error("Track Order Error:", error.message);
          }
        }
        return order.toObject();
      })
    );

    const uniqueOrders = Array.from(
      new Map(
        updatedOrders.map((order) => [order._id.toString(), order])
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
