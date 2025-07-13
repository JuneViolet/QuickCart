// // //api/search
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";

// Chuẩn hóa chuỗi (KHÔNG thay space)
const normalizeString = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
// .replace(/[^a-z0-9\s]/g, "");

export async function GET(request) {
  try {
    await connectDB();

    const user = await currentUser(); // Kiểm tra người dùng nếu có token
    const isSeller = user?.publicMetadata?.role === "seller";
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const categoryName = searchParams.get("category");

    const normalizedQuery = query ? normalizeString(query) : "";
    let searchFilter = {};

    if (normalizedQuery) {
      searchFilter.$text = { $search: normalizedQuery };
    }

    if (categoryName && normalizeString(categoryName) !== "all") {
      const normalizedCategory = normalizeString(categoryName);
      console.log("Normalized category input:", normalizedCategory);
      const categories = await Category.find().lean();
      const matchedCategory = categories.find(
        (cat) => normalizeString(cat.name) === normalizedCategory
      );
      console.log("Found category:", matchedCategory);
      if (matchedCategory) {
        searchFilter.category = matchedCategory._id;
      } else {
        console.log("No category found for normalized:", normalizedCategory);
        return NextResponse.json({
          success: true,
          products: [],
          message: `No category found for normalized: ${normalizedCategory}`,
        });
      }
    }

    let products;
    if (user && isSeller) {
      // Seller: chỉ tìm kiếm sản phẩm của họ
      searchFilter.userId = user.id;
      if (searchFilter.$text) {
        // Chỉ sử dụng textScore khi có $text
        products = await Product.find(searchFilter, {
          score: { $meta: "textScore" },
        })
          .select("name images category price offerPrice")
          .populate("category brand", "name")
          .sort({ score: { $meta: "textScore" } })
          .limit(20)
          .lean();
      } else {
        // Không có $text, chỉ dùng filter thông thường
        products = await Product.find(searchFilter)
          .select("name images category price offerPrice")
          .populate("category brand", "name")
          .limit(20)
          .lean();
      }
    } else {
      // Khách hàng hoặc không đăng nhập: tìm kiếm toàn bộ
      if (!query && !categoryName) {
        products = await Product.find()
          .select("name images category price offerPrice")
          .populate("category brand", "name")
          .limit(20)
          .lean();
      } else {
        if (searchFilter.$text) {
          products = await Product.find(searchFilter, {
            score: { $meta: "textScore" },
          })
            .select("name images category price offerPrice")
            .populate("category brand", "name")
            .sort({ score: { $meta: "textScore" } })
            .limit(20)
            .lean();
        } else {
          products = await Product.find(searchFilter)
            .select("name images category price offerPrice")
            .populate("category brand", "name")
            .limit(20)
            .lean();
        }
      }
    }

    console.log("Search filter:", searchFilter);
    console.log("Fetched products count:", products.length);

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
