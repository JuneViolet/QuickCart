import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";

export const GET = async (request) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 5;

    // Lấy vài đơn hàng gần đây để debug
    const orders = await Order.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .populate("items.product")
      .select("_id userId status amount date createdAt items");

    console.log("Debug Orders:");
    console.log("Total orders found:", orders.length);

    const result = orders.map((order) => ({
      _id: order._id,
      userId: order.userId,
      status: order.status,
      amount: order.amount,
      date: order.date,
      createdAt: order.createdAt,
      itemsCount: order.items?.length || 0,
      firstProduct: order.items?.[0]?.product?.name || "No product",
    }));

    return NextResponse.json({
      totalOrders: orders.length,
      orders: result,
    });
  } catch (err) {
    console.error("Debug orders error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
