import connectDB from "@/config/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    await connectDB();
    const user = await currentUser();

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

    // Lấy tất cả đơn hàng có sử dụng mã giảm giá của seller
    const orders = await Order.find({
      promoCode: { $exists: true, $ne: null },
      "items.product": { $exists: true },
    })
      .populate({
        path: "items.product",
        match: { userId: user.id }, // Chỉ lấy sản phẩm của seller hiện tại
        select: "_id userId",
      })
      .populate("promoCode", "code sellerId")
      .lean();

    // Đếm số lượng đơn hàng cho mỗi mã giảm giá của seller
    const promoOrdersCount = {};

    orders.forEach((order) => {
      // Kiểm tra xem đơn hàng có chứa sản phẩm của seller không
      const hasSellerProduct = order.items.some(
        (item) => item.product && item.product.userId === user.id
      );

      // Kiểm tra xem mã giảm giá có thuộc về seller không
      if (
        hasSellerProduct &&
        order.promoCode &&
        order.promoCode.sellerId === user.id
      ) {
        const promoCode = order.promoCode.code;
        promoOrdersCount[promoCode] = (promoOrdersCount[promoCode] || 0) + 1;
      }
    });

    return NextResponse.json({
      success: true,
      promoOrdersCount,
    });
  } catch (error) {
    console.error("Check Promo Orders Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check promo orders: " + error.message,
      },
      { status: 500 }
    );
  }
}
