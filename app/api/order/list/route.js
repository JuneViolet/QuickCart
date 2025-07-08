// //ổn định nhất
// //api/order/list/route.js
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

//     const orders = await Order.find({ userId })
//       .populate("address items.product items.variantId")
//       .lean(); // Sử dụng lean() để tránh lỗi populate

//     // Lọc và xử lý dữ liệu không hợp lệ
//     const validOrders = orders.map((order) => ({
//       ...order,
//       items: order.items.map((item) => ({
//         ...item,
//         product: item.product || { name: "Sản phẩm không xác định" },
//         variantId: item.variantId || {},
//       })),
//     }));

//     console.log(
//       "Populated Orders:",
//       validOrders.map((o) => o.items.map((i) => i.product.name))
//     );
//     return NextResponse.json({ success: true, orders: validOrders });
//   } catch (error) {
//     console.error("Error in /api/order/list:", error.message);
//     return NextResponse.json(
//       { success: false, message: "Server error: " + error.message },
//       { status: 500 }
//     );
//   }
// }
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
        product: item.product || { name: "Sản phẩm không xác định" },
        variantId: item.variantId || {},
      })),
    }));

    return NextResponse.json({ success: true, orders: validOrders });
  } catch (error) {
    console.error("Error in /api/order/list:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
