import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    await connectDB();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, comment } = await request.json();

    if (!productId || !comment) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const newComment = {
      userId: user.id,
      username: user.firstName || "Anonymous",
      comment,
      createdAt: new Date(),
    };

    product.comments.push(newComment);
    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: "Comment added successfully",
        comment: newComment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Submit Comment Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to submit comment: " + error.message },
      { status: 500 }
    );
  }
}
