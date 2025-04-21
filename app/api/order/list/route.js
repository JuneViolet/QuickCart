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
import Address from "@/models/Address";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    console.log("User ID:", userId); // Log userId

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    console.log("Database connected"); // Log kết nối DB

    const orders = await Order.find({ userId })
      .populate("address")
      .populate("items.product")
      .exec();
    console.log("Orders for user:", orders); // Log đơn hàng

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error in /api/order/list:", error); // Log lỗi chi tiết
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
