import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";

export async function POST(request) {
  await connectDB();

  try {
    const { trackingCode, responseCode } = await request.json();
    console.log("Received verify-payment request:", {
      trackingCode,
      responseCode,
    });

    const order = await Order.findOne({ trackingCode });

    if (!order) {
      console.warn("Order not found:", trackingCode);
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (responseCode === "00") {
      order.status = "paid";
      await order.save();
      console.log("Payment verified for order:", trackingCode);
      return NextResponse.json({ success: true, message: "Payment verified" });
    } else {
      order.status = "failed";
      await order.save();
      console.log("Payment failed for order:", trackingCode);
      return NextResponse.json(
        { success: false, message: "Payment failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
