// import { NextResponse } from "next/server";
// import Product from "@/models/Product";
// import connectDB from "@/config/db";

// export async function GET(request, context) {
//   try {
//     await connectDB();

//     // Await params để lấy id
//     const { id } = await context.params;

//     // Kiểm tra ID hợp lệ
//     if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid product ID" },
//         { status: 400 }
//       );
//     }

//     // Tìm sản phẩm theo ID
//     const product = await Product.findById(id).populate(
//       "category brand",
//       "name"
//     );
//     if (!product) {
//       return NextResponse.json(
//         { success: false, message: "Product not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true, product }, { status: 200 });
//   } catch (error) {
//     console.error("Get Product Error:", error.message, error.stack);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch product: " + error.message },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import Specification from "@/models/Specification";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import connectDB from "@/config/db";

export async function GET(request, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id)
      .populate("category brand", "name")
      .populate({
        path: "specifications",
        select: "key value",
      })
      .populate({
        path: "relatedProducts",
        select:
          "name description price offerPrice images category stock brand reviews",
        options: { strictPopulate: false },
      })
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    console.log("Product Data:", product); // Thêm log để kiểm tra dữ liệu

    const averageRating = product.reviews?.length
      ? (
          product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : 0;

    const productWithRating = { ...product, averageRating };

    return NextResponse.json(
      { success: true, product: productWithRating },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Product Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product: " + error.message },
      { status: 500 }
    );
  }
}
