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

    return NextResponse.json({ success: true, specification: newSpec });
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
