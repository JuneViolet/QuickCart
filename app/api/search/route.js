// //api/search
// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Product from "@/models/Product";

// export async function GET(request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(request.url);
//     const query = searchParams.get("query");

//     if (!query) {
//       return NextResponse.json(
//         { success: false, error: "Query is required" },
//         { status: 400 }
//       );
//     }

//     if (!/[a-zA-Z0-9]/.test(query)) {
//       return NextResponse.json({ success: true, products: [] });
//     }

//     const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//     const results = await Product.find({
//       name: { $regex: escapedQuery, $options: "i" },
//     }).select("name images image"); // Chỉ lấy các trường cần thiết

//     console.log("Search results:", results); // Log để debug
//     return NextResponse.json({ success: true, products: results });
//   } catch (error) {
//     console.error("Error in search API:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
// app/api/search/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    const normalize = (str) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");

    const normalizedQuery = normalize(query);

    // Nếu query có chứa từ "dien thoai", ưu tiên lọc theo danh mục Điện Thoại
    const dienThoaiCategory = await Category.findOne({
      name: /điện thoại/i,
    }).lean();

    let searchFilter = { $text: { $search: normalizedQuery } };

    if (normalizedQuery.includes("dien thoai") && dienThoaiCategory) {
      searchFilter = {
        $and: [
          { category: dienThoaiCategory._id },
          { $text: { $search: normalizedQuery } },
        ],
      };
    }

    const products = await Product.find(searchFilter, {
      score: { $meta: "textScore" },
    })
      .select("name images image category price offerPrice")
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      products,
      totalPages: 1, // Tránh vỡ layout khi tìm kiếm
    });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
