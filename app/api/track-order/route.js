// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Order from "@/models/Order";

// export async function GET(req) {
//   await connectDB();

//   const { searchParams } = new URL(req.url);
//   const trackingCode = searchParams.get("order_code");

//   if (!trackingCode) {
//     return NextResponse.json(
//       { success: false, message: "Order code is required" },
//       { status: 400 }
//     );
//   }

//   try {
//     // Tìm đơn hàng theo trackingCode (có thể là TEMP-xxx hoặc mã GHN)
//     const order = await Order.findOne({
//       $or: [
//         { trackingCode },
//         { ghnTrackingCode: trackingCode },
//       ],
//     });

//     if (!order || !order.ghnTrackingCode) {
//       throw new Error("Không tìm thấy mã GHN phù hợp trong đơn hàng");
//     }

//     // Dùng mã GHN thật sự
//     const response = await fetch(
//       `https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail?order_code=${order.ghnTrackingCode}`,
//       {
//         method: "GET",
//         headers: {
//           Token: process.env.GHN_TOKEN,
//           ShopId: process.env.GHN_SHOP_ID,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Failed to track order");
//     }

//     return NextResponse.json({ success: true, data: data.data });
//   } catch (error) {
//     console.warn(`Track Order Error for ${trackingCode}:`, error.message);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";

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
      $or: [{ trackingCode: orderCode }, { ghnTrackingCode: orderCode }],
    });

    const realCode = order?.ghnTrackingCode || order?.trackingCode;

    if (!realCode || realCode.startsWith("TEMP-")) {
      return NextResponse.json(
        { success: false, message: "GHN tracking code not available yet" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail?order_code=${realCode}`,
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
    if (!response.ok || !data?.data) {
      throw new Error(data.message || "GHN API tracking failed");
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
