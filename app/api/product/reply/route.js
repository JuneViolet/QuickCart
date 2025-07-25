import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(request) {
  console.log("Reply API called at:", new Date().toISOString());

  try {
    await connectDB();
    const { userId } = getAuth(request);

    console.log("Auth userId:", userId);

    if (!userId) {
      console.log("No userId found in auth");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const requestBody = await request.json();
    console.log("Request body:", requestBody);

    const { productId, commentId, reply } = requestBody;

    if (!productId || !commentId || !reply?.trim()) {
      console.log("Missing required fields:", { productId, commentId, reply });
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user is the seller (owner of the product)
    if (product.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "Only the seller can reply to comments" },
        { status: 403 }
      );
    }

    // Find the comment and add reply
    const commentIndex = product.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if reply already exists
    if (product.comments[commentIndex].reply) {
      return NextResponse.json(
        { success: false, message: "Reply already exists for this comment" },
        { status: 400 }
      );
    }

    // Add reply to the comment
    product.comments[commentIndex].reply = reply.trim();
    product.comments[commentIndex].replyDate = new Date();

    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: "Reply added successfully",
        comment: product.comments[commentIndex],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reply Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add reply: " + error.message },
      { status: 500 }
    );
  }
}
