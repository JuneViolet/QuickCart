import { NextResponse } from "next/server";
import Product from "@/models/Product";
import Order from "@/models/Order";
import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    await connectDB();

    const { userId } = getAuth(request);
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, comment } = await request.json();

    if (!productId || !comment?.trim()) {
      return NextResponse.json(
        { success: false, message: "Product ID và comment đều là bắt buộc" },
        { status: 400 }
      );
    }

    // Kiểm tra xem user đã mua sản phẩm chưa
    console.log(
      "Checking purchase for userId:",
      userId,
      "productId:",
      productId
    );

    const orders = await Order.find({
      userId,
      "items.product": productId,
      status: {
        $in: [
          "shipped",
          "delivered",
          "ghn_success",
          "paid",
          "Đang giao",
          "Đã giao",
        ],
      },
    });

    console.log("Found orders:", orders.length);
    const hasPurchased = orders.length > 0;

    if (!hasPurchased) {
      return NextResponse.json(
        {
          success: false,
          message: "Bạn chỉ có thể bình luận sau khi mua sản phẩm",
        },
        { status: 403 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Kiểm tra xem user đã có comment chưa
    const existingCommentIndex = product.comments.findIndex(
      (c) => c.userId === userId
    );

    if (existingCommentIndex >= 0) {
      // Cập nhật comment hiện có
      product.comments[existingCommentIndex].comment = comment.trim();
      product.comments[existingCommentIndex].updatedAt = new Date();
    } else {
      // Thêm comment mới
      const newComment = {
        userId,
        username: user.firstName || "Anonymous",
        comment: comment.trim(),
        createdAt: new Date(),
      };
      product.comments.push(newComment);
    }

    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: "Comment added successfully",
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
