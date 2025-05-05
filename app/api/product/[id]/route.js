import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/config/db";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Kiểm tra ID hợp lệ
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Tìm sản phẩm theo ID
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, product },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Product Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product: " + error.message },
      { status: 500 }
    );
  }
}