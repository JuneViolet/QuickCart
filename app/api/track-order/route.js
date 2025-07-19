import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import axios from "axios";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderCode = searchParams.get("order_code");

  if (!orderCode) {
    return NextResponse.json(
      { success: false, message: "Order code is required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const order = await Order.findOne({
      $or: [{ trackingCode: orderCode }],
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const realCode = order.trackingCode;

    const ghnRes = await axios.get(
      `https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail`,
      {
        headers: {
          "Content-Type": "application/json",
          Token: process.env.GHN_TOKEN,
          ShopId: process.env.GHN_SHOP_ID,
        },
        params: { order_code: realCode },
      }
    );

    const ghnData = ghnRes.data;
    // Xóa log GHN response
    // console.log("📦 GHN tracking response:", JSON.stringify(ghnData, null, 2));

    if (ghnData.code === 200) {
      const ghnStatus = ghnData.data.status;
      let updatedStatus = order.status;
      if (ghnStatus === "ready_to_pick") updatedStatus = "Chờ lấy hàng";
      else if (ghnStatus === "delivering") updatedStatus = "Đang giao";
      else if (ghnStatus === "delivered") updatedStatus = "Đã giao";
      else if (ghnStatus === "cancel") updatedStatus = "Đã hủy";

      if (updatedStatus !== order.status) {
        await Order.findByIdAndUpdate(order._id, { status: updatedStatus });
        console.log(
          `📝 Updated order ${order._id} status to: ${updatedStatus}`
        );
      }

      return NextResponse.json({ success: true, data: ghnData.data });
    } else {
      throw new Error(
        `GHN failed with code ${ghnData.code}: ${ghnData.message}`
      );
    }
  } catch (error) {
    console.error("❌ Track Order Error for", orderCode, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
