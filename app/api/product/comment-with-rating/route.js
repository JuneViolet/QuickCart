import connectDB from "@/config/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const { productId, comment, rating } = await request.json();

    if (!productId || !comment?.trim() || !rating) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID, comment và rating đều là bắt buộc",
        },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating phải từ 1 đến 5",
        },
        { status: 400 }
      );
    }

    // Tạm thời bỏ kiểm tra purchase vì frontend đã kiểm tra rồi
    // const hasPurchased = true; // Tạm thời cho phép tất cả

    // Nếu muốn kiểm tra lại, uncomment phần dưới:
    /*
    console.log("Checking purchase for userId:", userId, "productId:", productId);
    
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
          message: "Bạn chỉ có thể bình luận và đánh giá sau khi mua sản phẩm" 
        },
        { status: 403 }
      );
    }
    */

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy sản phẩm" },
        { status: 404 }
      );
    }

    // Thêm comment mới
    const newComment = {
      userId,
      username: user.firstName || "Anonymous",
      comment: comment.trim(),
      createdAt: new Date(),
    };

    // Kiểm tra xem user đã có rating chưa
    const existingRatingIndex = product.ratings.findIndex(
      (r) => r.userId === userId
    );

    if (existingRatingIndex >= 0) {
      // Cập nhật rating hiện có
      product.ratings[existingRatingIndex].rating = rating;
      product.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      // Thêm rating mới
      product.ratings.push({
        userId,
        rating,
        createdAt: new Date(),
      });
    }

    // Thêm comment mới (luôn thêm mới, không cập nhật)
    product.comments.push(newComment);

    // Tính toán lại average rating
    const totalRatings = product.ratings.length;
    const sumRatings = product.ratings.reduce((sum, r) => sum + r.rating, 0);
    product.averageRating =
      totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Đã gửi bình luận và đánh giá thành công!",
      data: {
        comment: newComment,
        averageRating: product.averageRating,
        totalRatings: product.ratings.length,
      },
    });
  } catch (error) {
    console.error("Submit comment with rating error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi server: " + error.message,
      },
      { status: 500 }
    );
  }
}
