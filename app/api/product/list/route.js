// // app/api/product/list/route.js
import connectDB from "@/config/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Chuẩn hóa chuỗi (KHÔNG thay space)
const normalizeString = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "");

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const skip = (page - 1) * limit;

    const categoryName = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const brandName = searchParams.get("brand");
    const searchQuery = searchParams.get("query");
    const userId = searchParams.get("userId"); // Thêm lọc theo seller (tùy chọn)

    let filters = {};

    // ==== Category filter ====
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json(
          { success: false, message: "Invalid categoryId" },
          { status: 400 }
        );
      }
      filters.category = categoryId;
    } else if (categoryName && normalizeString(categoryName) !== "all") {
      const normalized = normalizeString(categoryName);
      const categories = await Category.find().lean();
      const matched = categories.find(
        (cat) => normalizeString(cat.name) === normalized
      );
      if (!matched) {
        return NextResponse.json(
          { success: false, message: "Category not found" },
          { status: 404 }
        );
      }
      filters.category = matched._id;
    }

    // ==== Brand filter ====
    if (brandName) {
      const normalized = normalizeString(brandName);
      const brands = await Brand.find().lean();
      const matched = brands.find(
        (br) => normalizeString(br.name) === normalized
      );
      if (!matched) {
        return NextResponse.json(
          { success: false, message: "Brand not found" },
          { status: 404 }
        );
      }
      filters.brand = matched._id;
    }

    // ==== Seller filter (tùy chọn) ====
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { success: false, message: "Invalid userId" },
          { status: 400 }
        );
      }
      filters.userId = userId;
    }

    // ==== Query builder ====
    let mongoQuery = { ...filters };

    if (searchQuery) {
      const normalizedQuery = normalizeString(searchQuery);
      mongoQuery = {
        $and: [
          {
            $or: [
              { name: { $regex: normalizedQuery, $options: "i" } },
              { description: { $regex: normalizedQuery, $options: "i" } },
              {
                keywords: {
                  $in: normalizedQuery.split(/[, ]+/).map((k) => k.trim()),
                },
              }, // Tìm kiếm trong keywords
            ],
          },
          filters,
        ],
      };
    }

    // === Fetch products ===
    const products = await Product.find(mongoQuery)
      .select(
        "name description price offerPrice images category stock brand reviews keywords" // Thêm keywords
      )
      .populate("category brand", "name")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await Product.countDocuments(mongoQuery);

    const productsWithRating = products.map((product) => {
      const averageRating = product.reviews?.length
        ? (
            product.reviews.reduce((sum, r) => sum + r.rating, 0) /
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
    console.error("Get Products Error:", error);
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
        "name description price offerPrice images category stock brand reviews specifications keywords" // Thêm keywords
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
