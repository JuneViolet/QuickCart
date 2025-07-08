// import connectDB from "@/config/db";
// import Address from "@/models/Address";
// import Order from "@/models/Order";
// import Product from "@/models/Product";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);
//     await connectDB();

//     Address.length;
//     Product.length;

//     const orders = await Order.find({ userId }).populate(
//       "address items.product"
//     ); // không được thì thêm s

//     return NextResponse.json({ success: true, orders });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: error.message });
//   }
// }
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Address from "@/models/Address";
import Product from "@/models/Product";
import Variant from "@/models/Variants"; // Đảm bảo import
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
      .populate({
        path: "address",
        select: "fullName area ward city state phoneNumber",
      })
      .populate({
        path: "items.product",
        select: "name", // Chỉ lấy tên sản phẩm
      })
      .populate({
        path: "items.variantId",
        select: "attributeRefs images price offerPrice", // Lấy các trường cần thiết
        populate: {
          path: "attributeRefs.attributeId",
          model: "Attribute",
          select: "name values", // Đảm bảo lấy thông tin attribute
        },
      });

    // Debug log
    console.log(
      "Populated Orders:",
      orders.map((o) =>
        o.items.map((i) => ({
          product: i.product?.name,
          variantId: i.variantId?._id,
          attributeRefs: i.variantId?.attributeRefs,
          images: i.variantId?.images,
        }))
      )
    );

    // Gọi GHN API từ backend
    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        let ghnStatus = null;
        let ghnStatusText = getStatusFromDB(order.status) || "Chưa cập nhật";

        if (order.trackingCode) {
          try {
            const headers = {
              "Content-Type": "application/json",
              Token: process.env.GHN_TOKEN,
              ShopId: process.env.GHN_SHOP_ID,
            };
            console.log("GHN Request for trackingCode:", order.trackingCode);
            const response = await fetch(
              `https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail`,
              {
                method: "GET",
                headers,
                params: { order_code: order.trackingCode },
              }
            );
            if (!response.ok) {
              throw new Error(`GHN API returned ${response.status}`);
            }
            const ghnData = await response.json();
            console.log("GHN Response:", ghnData);
            ghnStatus = ghnData.data?.status || null;
            ghnStatusText = ghnData.data?.status_name || ghnStatusText;
          } catch (error) {
            console.error("GHN API Error for order", order._id, error.message);
            ghnStatusText = `Lỗi truy vấn: ${error.message}`;
          }
        }

        return {
          ...order.toObject(),
          ghnStatus,
          ghnStatusText,
        };
      })
    );

    return NextResponse.json({ success: true, orders: updatedOrders });
  } catch (error) {
    console.error("Error in /api/order/list:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi lấy danh sách đơn hàng: " + error.message,
      },
      { status: 500 }
    );
  }
}

// Hàm ánh xạ trạng thái từ DB
function getStatusFromDB(status) {
  switch (status?.toLowerCase()) {
    case "ghn_success":
      return "Giao thành công";
    case "ghn_pending":
      return "Chờ lấy hàng";
    case "ghn_delivering":
      return "Đang giao";
    case "ghn_cancelled":
      return "Đã hủy";
    default:
      return "Chưa cập nhật";
  }
}
