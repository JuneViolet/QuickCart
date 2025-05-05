// import { NextResponse } from "next/server";
// import Product from "@/models/Product";
// import connectDB from "@/config/db";
// import { currentUser } from "@clerk/nextjs/server"; // Thay getUser bằng currentUser

// export async function POST(request) {
//   try {
//     await connectDB();

//     // Lấy thông tin user từ Clerk
//     const user = await currentUser(); // Sử dụng currentUser
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { productId, rating, comment } = await request.json();

//     // Kiểm tra dữ liệu đầu vào
//     if (!productId || !rating || !comment) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Tìm sản phẩm
//     const product = await Product.findById(productId);
//     if (!product) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     // Thêm đánh giá mới
//     const newReview = {
//       userId: user.id,
//       rating,
//       comment,
//       createdAt: new Date(),
//     };

//     product.reviews.push(newReview);
//     await product.save();

//     return NextResponse.json(
//       { message: "Review added successfully", review: newReview },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    await connectDB();

    // Lấy thông tin user từ Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, rating, comment } = await request.json();

    // Kiểm tra dữ liệu đầu vào
    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Kiểm tra rating hợp lệ
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Tìm sản phẩm
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Thêm đánh giá mới
    const newReview = {
      userId: user.id,
      username: user.firstName || "Anonymous", // Lưu username từ Clerk
      rating,
      comment,
      createdAt: new Date(),
    };

    product.reviews.push(newReview);
    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: "Review added successfully",
        review: newReview,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Submit Review Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to submit review: " + error.message },
      { status: 500 }
    );
  }
}
