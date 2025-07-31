import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB();

    // Lấy orders có status pending trong 10 phút gần đây
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const pendingOrders = await Order.find({
      status: "pending",
      date: { $gte: tenMinutesAgo },
    }).select("_id trackingCode date status paymentMethod ghnError");

    const ghnFailedOrders = await Order.find({
      status: "ghn_failed",
      date: { $gte: tenMinutesAgo },
    }).select("_id trackingCode date status paymentMethod ghnError");

    return NextResponse.json({
      success: true,
      summary: {
        pendingOrders: pendingOrders.length,
        ghnFailedOrders: ghnFailedOrders.length,
        totalProblematic: pendingOrders.length + ghnFailedOrders.length,
      },
      details: {
        pending: pendingOrders,
        ghnFailed: ghnFailedOrders,
      },
    });
  } catch (error) {
    console.error("Health check error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Endpoint để retry failed orders
export async function POST(request) {
  try {
    await connectDB();

    const { orderIds } = await request.json();

    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json(
        { success: false, message: "Invalid orderIds array" },
        { status: 400 }
      );
    }

    const retryResults = [];

    for (const orderId of orderIds) {
      try {
        const order = await Order.findById(orderId).populate("address");

        if (!order) {
          retryResults.push({
            orderId,
            success: false,
            error: "Order not found",
          });
          continue;
        }

        if (
          order.paymentMethod === "cod" &&
          (order.status === "pending" || order.status === "ghn_failed")
        ) {
          // Import processGHNOrder
          const { processGHNOrder } = await import(
            "@/app/api/order/create/route"
          );

          await processGHNOrder(
            order._id,
            order.trackingCode,
            order.items,
            order.address,
            order.amount
          );

          retryResults.push({
            orderId,
            success: true,
            message: "Retried successfully",
          });
        } else {
          retryResults.push({
            orderId,
            success: false,
            error: `Order not eligible for retry (status: ${order.status}, payment: ${order.paymentMethod})`,
          });
        }
      } catch (error) {
        retryResults.push({ orderId, success: false, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      results: retryResults,
    });
  } catch (error) {
    console.error("Retry orders error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
