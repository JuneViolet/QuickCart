// import { NextResponse } from "next/server";
// import Product from "@/models/Product";
// import Variant from "@/models/Variants";
// import Specification from "@/models/Specification";
// import Category from "@/models/Category";
// import Brand from "@/models/Brand";
// import Attribute from "@/models/Attribute";
// import connectDB from "@/config/db";

// export async function GET(request, context) {
//   try {
//     await connectDB();
//     const { id } = await context.params;

//     if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid product ID" },
//         { status: 400 }
//       );
//     }

//     const product = await Product.findById(id)
//       .populate("category brand", "name")
//       .populate({
//         path: "specifications",
//         select: "key value",
//       })
//       .populate({
//         path: "relatedProducts",
//         select:
//           "name description price offerPrice images category stock brand reviews",
//         options: { strictPopulate: false },
//       })
//       .populate({
//         path: "variants",
//         select: "price offerPrice stock sku image attributeRefs",
//         populate: {
//           path: "attributeRefs.attributeId",
//           model: "Attribute",
//           select: "name values",
//         },
//       })
//       .lean();

//     if (!product) {
//       return NextResponse.json(
//         { success: false, message: "Product not found" },
//         { status: 404 }
//       );
//     }

//     const averageRating = product.reviews?.length
//       ? (
//           product.reviews.reduce((sum, review) => sum + review.rating, 0) /
//           product.reviews.length
//         ).toFixed(1)
//       : 0;

//     const productWithRating = {
//       ...product,
//       averageRating,
//     };

//     return NextResponse.json(
//       { success: true, product: productWithRating },
//       { status: 200 }
//     );
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
import Variant from "@/models/Variants";
import Specification from "@/models/Specification";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import Attribute from "@/models/Attribute";
import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request, context) {
  try {
    await connectDB();
    const { userId } = getAuth(request);

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    console.log("Fetching product with ID:", id, "User ID:", userId); // Debug

    // Sử dụng logic public mặc định, chỉ kiểm tra userId nếu người dùng là seller
    let product;
    if (userId) {
      product = await Product.findOne({
        $or: [{ _id: id }, { _id: id, userId }],
      })
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
        .populate({
          path: "variants",
          select: "price offerPrice stock sku image images attributeRefs",
          populate: {
            path: "attributeRefs.attributeId",
            model: "Attribute",
            select: "name values",
          },
        })
        .lean();
    } else {
      // Public access
      product = await Product.findOne({ _id: id })
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
        .populate({
          path: "variants",
          select: "price offerPrice stock sku image images attributeRefs",
          populate: {
            path: "attributeRefs.attributeId",
            model: "Attribute",
            select: "name values",
          },
        })
        .lean();
    }

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found or access denied" },
        { status: 404 }
      );
    }

    const averageRating = product.reviews?.length
      ? (
          product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : 0;

    const productWithRating = {
      ...product,
      averageRating,
    };

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
