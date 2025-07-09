import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req) {
  await connectDB();

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId, action } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (action === "confirm" && order.status === "pending") {
      order.status = "paid"; // Hoặc "confirmed" tùy logic
      await order.save();
      return NextResponse.json({
        success: true,
        message: "Đơn hàng đã được xác nhận",
      });
    } else if (
      action === "cancel" &&
      ["pending", "paid"].includes(order.status)
    ) {
      order.status = "canceled";
      await order.save();
      return NextResponse.json({
        success: true,
        message: "Đơn hàng đã bị hủy",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Hành động không hợp lệ" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Seller action error:", error);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
