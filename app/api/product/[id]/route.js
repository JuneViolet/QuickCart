// //ổn dịnh
// import { NextResponse } from "next/server";
// import Product from "@/models/Product";
// import Variant from "@/models/Variants";
// import Specification from "@/models/Specification";
// import Category from "@/models/Category";
// import Brand from "@/models/Brand";
// import Attribute from "@/models/Attribute";
// import connectDB from "@/config/db";
// import { getAuth } from "@clerk/nextjs/server";

// export async function GET(request, context) {
//   try {
//     await connectDB();
//     const { userId } = getAuth(request);

//     const { id } = await context.params;

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: "Product ID is required" },
//         { status: 400 }
//       );
//     }

//     console.log("Fetching product with ID:", id, "User ID:", userId); // Debug

//     // Sử dụng logic public mặc định, chỉ kiểm tra userId nếu người dùng là seller
//     let product;
//     if (userId) {
//       product = await Product.findOne({
//         $or: [{ _id: id }, { _id: id, userId }],
//       })
//         .populate("category brand", "name")
//         .populate({
//           path: "specifications",
//           select: "key value",
//         })
//         .populate({
//           path: "relatedProducts",
//           select:
//             "name description price offerPrice images category stock brand reviews",
//           options: { strictPopulate: false },
//         })
//         .populate({
//           path: "variants",
//           select: "price offerPrice stock sku image images attributeRefs",
//           populate: {
//             path: "attributeRefs.attributeId",
//             model: "Attribute",
//             select: "name values",
//           },
//         })
//         .lean();
//     } else {
//       // Public access
//       product = await Product.findOne({ _id: id })
//         .populate("category brand", "name")
//         .populate({
//           path: "specifications",
//           select: "key value",
//         })
//         .populate({
//           path: "relatedProducts",
//           select:
//             "name description price offerPrice images category stock brand reviews",
//           options: { strictPopulate: false },
//         })
//         .populate({
//           path: "variants",
//           select: "price offerPrice stock sku image images attributeRefs",
//           populate: {
//             path: "attributeRefs.attributeId",
//             model: "Attribute",
//             select: "name values",
//           },
//         })
//         .lean();
//     }

//     if (!product) {
//       return NextResponse.json(
//         { success: false, message: "Product not found or access denied" },
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
import Order from "@/models/Order"; // Giả định có model Order

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

    // Kiểm tra xem user đã mua sản phẩm chưa
    let hasPurchased = false;
    if (userId) {
      const orders = await Order.find({
        userId,
        "items.product": product._id,
        status: { $in: ["Đang giao", "ghn_success", "paid"] }, // Chỉ tính đơn đã giao hoặc đã thanh toán
      });
      hasPurchased = orders.length > 0;
    }

    // Tính averageRating từ ratings
    const averageRating = product.ratings?.length
      ? (
          product.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
          product.ratings.length
        ).toFixed(1)
      : 0;

    const productWithRating = {
      ...product,
      averageRating,
      hasPurchased,
      ratings: product.ratings || [], // Đảm bảo trả về mảng rỗng nếu không có
      comments: product.comments || [], // Đảm bảo trả về mảng rỗng nếu không có
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
