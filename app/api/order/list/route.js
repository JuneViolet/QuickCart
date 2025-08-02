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
      .populate("address items.product")
      .populate({
        path: "items.variantId",
        select: "price offerPrice stock sku attributeRefs images",
      })
      .lean();

    if (!orders || orders.length === 0) {
      return NextResponse.json({ success: true, orders: [] });
    }

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
      "📋 Fetched orders with promo details:",
      validOrders.map((o) => ({
        _id: o._id,
        trackingCode: o.trackingCode,
        promoCode: o.promoCode,
        promoDiscount: o.promoDiscount,
        promoType: o.promoType,
      }))
    );
    //   }))
    // );

    return NextResponse.json(
      { success: true, orders: validOrders },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/order/list:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
