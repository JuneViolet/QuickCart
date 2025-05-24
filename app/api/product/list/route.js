// import connectDB from "@/config/db";
// import Product from "@/models/Product";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     await connectDB();

//     const product = await Product.find({});

//     return NextResponse.json({ success: true, product });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: error.message });
//   }
// }
// import connectDB from "@/config/db";
// import Product from "@/models/Product";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 10;
//     const skip = (page - 1) * limit;

//     const products = await Product.find({})
//       .select(
//         "name description price offerPrice images category stock brand reviews"
//       )
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const totalProducts = await Product.countDocuments();

//     const productsWithRating = products.map((product) => {
//       const averageRating = product.reviews?.length
//         ? (
//             product.reviews.reduce((sum, review) => sum + review.rating, 0) /
//             product.reviews.length
//           ).toFixed(1)
//         : 0;
//       return { ...product, averageRating };
//     });

//     return NextResponse.json({
//       success: true,
//       products: productsWithRating,
//       totalProducts,
//       currentPage: page,
//       totalPages: Math.ceil(totalProducts / limit),
//     });
//   } catch (error) {
//     console.error("Get Products Error:", error.message, error.stack);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch products: " + error.message },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request) {
//   try {
//     await connectDB();

//     const { ids } = await request.json();
//     console.log("Requested IDs in POST:", ids); // Log IDs nhận được

//     if (!ids || !Array.isArray(ids) || ids.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid or empty IDs array" },
//         { status: 400 }
//       );
//     }

//     const products = await Product.find({ _id: { $in: ids } })
//       .select(
//         "name description price offerPrice image category stock brand reviews"
//       )
//       .lean();

//     const productsWithRating = products.map((product) => {
//       const averageRating = product.reviews?.length
//         ? (
//             product.reviews.reduce((sum, review) => sum + review.rating, 0) /
//             product.reviews.length
//           ).toFixed(1)
//         : 0;
//       return { ...product, averageRating };
//     });

//     console.log("Found products in POST:", productsWithRating); // Log sản phẩm tìm thấy

//     return NextResponse.json({
//       success: true,
//       products: productsWithRating,
//     });
//   } catch (error) {
//     console.error("Post Products Error:", error.message, error.stack);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch products: " + error.message },
//       { status: 500 }
//     );
//   }
// }
import connectDB from "@/config/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;
    const categoryId = searchParams.get("categoryId");

    let query = {};
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json(
          { success: false, message: "Invalid categoryId" },
          { status: 400 }
        );
      }
      query.category = categoryId;
    }

    const products = await Product.find(query)
      .select(
        "name description price offerPrice images category stock brand reviews"
      ) // Sửa image thành images
      .populate("category brand", "name") // Thêm populate
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await Product.countDocuments(query);

    const productsWithRating = products.map((product) => {
      const averageRating = product.reviews?.length
        ? (
            product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          ).toFixed(1)
        : 0;
      return { ...product, averageRating };
    });

    return NextResponse.json({
      success: true,
      products: productsWithRating,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    console.error("Get Products Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const { ids } = await request.json();
    console.log("Requested IDs in POST:", ids);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or empty IDs array" },
        { status: 400 }
      );
    }

    // Kiểm tra các id có hợp lệ không
    if (ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json(
        { success: false, message: "One or more invalid product IDs" },
        { status: 400 }
      );
    }

    const products = await Product.find({ _id: { $in: ids } })
      .select(
        "name description price offerPrice images category stock brand reviews"
      ) // Sửa image thành images
      .populate("category brand", "name") // Thêm populate
      .lean();

    const productsWithRating = products.map((product) => {
      const averageRating = product.reviews?.length
        ? (
            product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          ).toFixed(1)
        : 0;
      return { ...product, averageRating };
    });

    console.log("Found products in POST:", productsWithRating);

    return NextResponse.json({
      success: true,
      products: productsWithRating,
    });
  } catch (error) {
    console.error("Post Products Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products: " + error.message },
      { status: 500 }
    );
  }
}
