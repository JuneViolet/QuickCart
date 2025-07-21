import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { currentUser } from "@clerk/nextjs/server";

export async function PUT(request, context) {
  try {
    await connectDB();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params; // Await params
    const { id: productId } = params;
    const { rating } = await request.json();

    if (!productId || rating === undefined || rating === null) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
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

    // Kiểm tra và cập nhật rating cho user
    const existingRatingIndex = product.ratings.findIndex(
      (r) => r.userId === user.id
    );
    if (existingRatingIndex >= 0) {
      product.ratings[existingRatingIndex].rating = rating;
      product.ratings[existingRatingIndex].updatedAt = new Date();
    } else {
      product.ratings.push({
        userId: user.id,
        username: user.firstName || "Anonymous",
        rating,
        updatedAt: new Date(),
      });
    }

    // Tính lại averageRating dựa trên tất cả ratings
    const averageRating =
      product.ratings.length > 0
        ? (
            product.ratings.reduce((sum, r) => sum + r.rating, 0) /
            product.ratings.length
          ).toFixed(1)
        : 0;
    product.averageRating = Number(averageRating);

    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: "Rating updated successfully",
        rating,
        averageRating: product.averageRating,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Rating Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to update rating: " + error.message },
      { status: 500 }
    );
  }
}
