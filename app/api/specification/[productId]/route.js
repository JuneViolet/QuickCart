import connectDB from "@/config/db";
import Specification from "@/models/Specification";
import Product from "@/models/Product"; // Thêm import Product
import { NextResponse } from "next/server";

export async function GET(request, context) {
  try {
    await connectDB();
    const { params } = await context;
    const { productId } = params;

    const specifications = await Specification.find({ productId }).lean();
    if (!specifications || specifications.length === 0) {
      return NextResponse.json(
        { success: false, message: "No specifications found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, specifications });
  } catch (error) {
    console.error("Get Specifications Error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch specifications: " + error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectDB();
    const { params } = await context;
    const { productId } = params;
    const { specId } = await request.json();

    const result = await Specification.findByIdAndDelete(specId);
    if (!result) {
      return NextResponse.json(
        { success: false, message: "Specification not found" },
        { status: 404 }
      );
    }

    // Xóa specId khỏi mảng specifications trong Product
    await Product.findByIdAndUpdate(
      productId,
      { $pull: { specifications: specId } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("Delete Specification Error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete specification: " + error.message,
      },
      { status: 500 }
    );
  }
}
