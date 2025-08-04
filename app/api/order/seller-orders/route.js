// //ỔN ĐỊNH
// import connectDB from "@/config/db";
// import authSeller from "@/lib/authSeller";
// import Order from "@/models/Order";
// import Product from "@/models/Product";
// import Address from "@/models/Address";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import axios from "axios";

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

//     const sellerProducts = await Product.find({ userId: userId }).select("_id");
//     const productIds = sellerProducts.map((p) => p._id.toString());
//     console.log("Seller Product IDs:", productIds);

//     const ordersFromDB = await Order.find({
//       "items.product": { $in: productIds },
//     })
//       .populate("address")
//       .populate("items.product")
//       .populate("items.variantId") // Thêm populate cho variantId
//       .exec();
//     console.log("Orders from DB (raw):", ordersFromDB);

//     const updatedOrders = await Promise.all(
//       ordersFromDB.map(async (order) => {
//         let orderData = order.toObject();
//         if (order.trackingCode) {
//           try {
//             const { data: ghtkData } = await axios.post("/api/ghtk", {
//               action: "trackOrder",
//               payload: { trackingCode: order.trackingCode },
//             });
//             if (ghtkData.success) {
//               orderData.ghtkStatus = ghtkData.data.status;
//             }
//           } catch (ghtkError) {
//             console.warn("GHTK Tracking Error:", ghtkError.message);
//             orderData.ghtkStatus = "Tracking Failed";
//           }
//         }
//         // Gán trạng thái mặc định nếu không có ghtkStatus
//         orderData.status = orderData.ghtkStatus || order.status || "Pending";
//         return orderData;
//       })
//     );

//     const uniqueOrders = Array.from(
//       new Map(
//         updatedOrders.map((order) => [order._id.toString(), order])
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

    const sellerProducts = await Product.find({ userId: userId }).select("_id");
    const productIds = sellerProducts.map((p) => p._id.toString());
    console.log("Seller Product IDs:", productIds);

    const ordersFromDB = await Order.find({
      "items.product": { $in: productIds },
    })
      .populate("address")
      .populate("items.product")
      .populate({
        path: "items.variantId",
        select: "offerPrice price stock sku images attributeRefs",
        populate: {
          path: "attributeRefs.attributeId",
          model: "Attribute",
          select: "name values",
        },
      })
      .exec();
    console.log("Orders from DB (raw):", ordersFromDB);

    const updatedOrders = await Promise.all(
      ordersFromDB.map(async (order) => {
        if (!order) return null; // Bảo vệ chống undefined

        let orderData = order.toObject();
        if (order.trackingCode && !order.trackingCode.startsWith("TEMP-")) {
          try {
            const { data: ghnData } = await axios.get(
              `/api/track-order?order_code=${order.trackingCode}`
            );
            if (ghnData.success) {
              orderData.ghnStatus = ghnData.data?.status || null;
              orderData.ghnStatusText =
                ghnData.data?.status_name || "Chờ lấy hàng";
            }
          } catch (ghnError) {
            console.warn(
              "GHN Tracking Error for",
              order.trackingCode,
              ghnError.message
            );
            orderData.ghnStatus = null;
            orderData.ghnStatusText = "Chờ lấy hàng"; // Mặc định cho test mode
          }
        }
        // Gán trạng thái tổng hợp
        orderData.statusText =
          orderData.ghnStatusText || getStatusText(order.status);
        return orderData;
      })
    ).then((orders) => orders.filter((order) => order !== null)); // Loại bỏ null values

    // Loại bỏ logic Map nếu không cần thiết (mỗi order._id đã duy nhất)
    console.log("Updated Orders:", updatedOrders);

    return NextResponse.json({ success: true, orders: updatedOrders });
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

// Hàm ánh xạ trạng thái
const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "Chờ xác nhận";
    case "paid":
      return "Đã thanh toán";
    case "ghn_success":
      return "Chờ lấy hàng";
    case "shipped":
      return "Đang giao";
    case "delivered":
      return "Giao thành công";
    case "canceled":
      return "Đã hủy";
    case "ghn_failed":
      return "Lỗi tạo đơn GHN";
    default:
      return "Chưa xác định";
  }
};
