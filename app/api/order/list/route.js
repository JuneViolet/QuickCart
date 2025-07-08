// //ổn định nhất
// import connectDB from "@/config/db";
// import Order from "@/models/Order";
// import Address from "@/models/Address";
// import Product from "@/models/Product";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     await connectDB();

//     const orders = await Order.find({ userId }).populate(
//       "address items.product items.variantId"
//     );
//     console.log(
//       "Populated Orders:",
//       orders.map((o) =>
//         o.items.map((i) => ({
//           product: i.product?.name,
//           variantId: i.variantId ? i.variantId._id : null,
//           attributeRefs: i.variantId ? i.variantId.attributeRefs : null,
//         }))
//       )
//     ); // Log để debug

//     return NextResponse.json({ success: true, orders });
//   } catch (error) {
//     console.error("Error in /api/order/list:", error.message);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
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

    const orders = await Order.find({ userId }).populate(
      "address items.product items.variantId"
    );

    const mappedOrders = orders.map((order) => {
      let ghnStatusText = "";

      if (order.status === "ghn_success") {
        ghnStatusText = "Đã gửi GHN thành công";
      } else if (order.status === "ghn_failed") {
        ghnStatusText = `Lỗi truy vấn: ${order.ghnError || "Không rõ"}`;
      } else if (order.status === "paid") {
        ghnStatusText = "Đã thanh toán (chờ xử lý GHN)";
      } else if (order.status === "pending") {
        ghnStatusText = "Đang chờ thanh toán";
      } else {
        ghnStatusText = order.status || "Không xác định";
      }

      return {
        ...order.toObject(),
        ghnStatusText,
      };
    });

    return NextResponse.json({ success: true, orders: mappedOrders });
  } catch (error) {
    console.error("Error in /api/order/list:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
