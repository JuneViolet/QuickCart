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
// app/api/product/list/route.js
import connectDB from "@/config/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Hàm chuẩn hóa chuỗi: đồng bộ với MegaMenu.jsx
const normalizeString = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;
    const categoryName = searchParams.get("category");
    const brandName = searchParams.get("brand"); // Lấy tham số brand

    let query = {};
    if (categoryName) {
      const normalizedCategoryName = normalizeString(categoryName);
      console.log("Normalized categoryName:", normalizedCategoryName);

      const categories = await Category.find().lean();
      // console.log("All categories from DB:", categories);

      const matchedCategory = categories.find(
        (cat) => normalizeString(cat.name) === normalizedCategoryName
      );
      // console.log("Matched category:", matchedCategory);

      if (!matchedCategory) {
        console.log("No matching category found for:", normalizedCategoryName);
        return NextResponse.json(
          { success: false, message: "Category not found" },
          { status: 404 }
        );
      }

      query.category = matchedCategory._id;
      // console.log("Query category ID:", matchedCategory._id);
    }

    if (brandName) {
      const normalizedBrandName = normalizeString(brandName);
      console.log("Normalized brandName:", normalizedBrandName);

      const brands = await Brand.find().lean();
      // console.log("All brands from DB:", brands);

      const matchedBrand = brands.find(
        (br) => normalizeString(br.name) === normalizedBrandName
      );
      // console.log("Matched brand:", matchedBrand);

      if (!matchedBrand) {
        console.log("No matching brand found for:", normalizedBrandName);
        return NextResponse.json(
          { success: false, message: "Brand not found" },
          { status: 404 }
        );
      }

      query.brand = matchedBrand._id;
      console.log("Query brand ID:", matchedBrand._id);
    }

    const products = await Product.find(query)
      .select(
        "name description price offerPrice images category stock brand reviews"
      )
      .populate("category brand", "name")
      .skip(skip)
      .limit(limit)
      .lean();

    // console.log("Found products:", products);

    const totalProducts = await Product.countDocuments(query);
    // console.log("Total products count:", totalProducts);

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

    if (ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json(
        { success: false, message: "One or more invalid product IDs" },
        { status: 400 }
      );
    }

    const products = await Product.find({ _id: { $in: ids } })
      .select(
        "name description price offerPrice images category stock brand reviews specifications"
      )
      .populate("category brand", "name")
      .populate({
        path: "specifications",
        model: "Specification",
      })
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

    console.log(
      "Found products in POST with specifications:",
      productsWithRating
    );

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
