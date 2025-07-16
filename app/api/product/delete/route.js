import connectDB from "@/config/db";
import Product from "@/models/Product";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const user = await currentUser();
    console.log("API received userId:", user?.id); // Debug userId từ Clerk

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = await request.json();
    console.log("API received productId:", productId); // Debug productId

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const product = await Product.findById(productId);
    console.log("Product from DB:", product); // Debug sản phẩm

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.userId !== user.id) {
      console.log("Authorization failed - userId mismatch:", {
        productUserId: product.userId,
        currentUserId: user.id,
      });
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to delete this product",
        },
        { status: 403 }
      );
    }

    await Product.findByIdAndDelete(productId);
    return NextResponse.json(
      { success: true, message: "Xóa sản phẩm thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
