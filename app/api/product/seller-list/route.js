import connectDB from "@/config/db";
import Product from "@/models/Product";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Kiểm tra người dùng
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please sign in" },
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

    await connectDB();

    // Lấy tất cả sản phẩm của seller hiện tại và populate category và brand
    const products = await Product.find({ userId: user.id })
      .populate("category brand", "name")
      .lean(); // Sử dụng .lean() để tăng hiệu suất

    if (!products) {
      return NextResponse.json({
        success: true,
        products: [],
        message: "No products found for this seller.",
      });
    }

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Fetch Seller Products Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products: " + error.message },
      { status: 500 }
    );
  }
}
