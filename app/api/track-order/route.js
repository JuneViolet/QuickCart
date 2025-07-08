import { NextResponse } from "next/server";

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
    const response = await fetch(
      `https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail?order_code=${orderCode}`,
      {
        method: "GET",
        headers: {
          Token: process.env.GHN_TOKEN,
          ShopId: process.env.GHN_SHOP_ID,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to track order");
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.warn(`Track Order Error for ${orderCode}:`, error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
