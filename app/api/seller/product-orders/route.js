import connectDB from "@/config/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    await connectDB();
    const user = await currentUser();

    console.log("Product Orders - User:", user ? user.id : "No user");
    console.log("Product Orders - Role:", user?.publicMetadata?.role);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Kiểm tra vai trò seller
    const isSeller = user?.publicMetadata?.role === "seller";
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Seller role required" },
        { status: 403 }
      );
    }

    // Lấy tất cả đơn hàng có chứa sản phẩm của seller
    const orders = await Order.find({
      "items.product": { $exists: true },
    })
      .populate({
        path: "items.product",
        match: { userId: user.id }, // Chỉ lấy sản phẩm của seller hiện tại
        select: "_id userId",
      })
      .lean();

    // Đếm số lượng đơn hàng cho mỗi sản phẩm
    const productOrders = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product && item.product.userId === user.id) {
          const productId = item.product._id.toString();
          productOrders[productId] = (productOrders[productId] || 0) + 1;
        }
      });
    });

    return NextResponse.json({
      success: true,
      productOrders,
    });
  } catch (error) {
    console.error("Get Product Orders Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get product orders: " + error.message,
      },
      { status: 500 }
    );
  }
}
