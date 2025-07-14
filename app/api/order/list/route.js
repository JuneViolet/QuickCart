import connectDB from "@/config/db";
import Order from "@/models/Order";
import Address from "@/models/Address";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const orders = await Order.find({ userId })
      .populate("address items.product items.variantId")
      .lean();

    const validOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product || {
          name: "Sản phẩm không xác định",
          error: "Product not found",
        },
        variantId: item.variantId || {},
      })),
    }));

    console.log(
      "📋 Fetched orders with statuses:",
      validOrders.map((o) => ({
        trackingCode: o.trackingCode,
        status: o.status,
      }))
    );
    return NextResponse.json({ success: true, orders: validOrders });
  } catch (error) {
    console.error("Error in /api/order/list:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
