import connectDB from "@/config/db";
import Specification from "@/models/Specification";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { productId, key, value, categoryId } = await request.json();

    if (!productId || !key || !value || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const exitstingSpec = await Specification.findOne({
      productId,
      key: key.trim(),
    });

    if (exitstingSpec) {
      return NextResponse.json(
        {
          success: false,
          message: "Thông số này đã tồn tại trong sản phẩm này",
        },
        { status: 409 }
      );
    }

    const newSpec = await Specification.create({
      productId,
      key,
      value,
      categoryId,
    });

    await Product.findByIdAndUpdate(
      productId,
      { $push: { specifications: newSpec._id } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      Specification: newSpec,
      message: "Thêm thông số thành công",
    });
  } catch (error) {
    console.error("Post Specifications Error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add specification: " + error.message,
      },
      { status: 500 }
    );
  }
}
