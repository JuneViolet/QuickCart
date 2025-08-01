import connectDB from "@/config/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Chuẩn hóa chuỗi (GIỮ NGUYÊN khoảng cách để khớp với database)
const normalizeString = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

// Tách từ khóa và loại bỏ khoảng cách dư thừa
const splitSearchTerms = (query) =>
  query
    .split(/\s+/) // Tách bởi bất kỳ khoảng trắng nào
    .map((term) => term.trim()) // Giữ nguyên từ, chỉ trim khoảng cách đầu cuối
    .filter((term) => term.length > 0);

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const categoryName = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const brandName = searchParams.get("brand");
    const searchQuery = searchParams.get("query");
    const userId = searchParams.get("userId");
    const minPrice = parseInt(searchParams.get("minPrice")) || 0;
    const maxPrice = parseInt(searchParams.get("maxPrice")) || 100000000;
    const sort = searchParams.get("sort") || "";

    let filters = {};

    console.log("Received params:", {
      categoryName,
      categoryId,
      brandName,
      searchQuery,
      userId,
      minPrice,
      maxPrice,
      sort,
    });

    // ==== Category filter ====
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json(
          { success: false, message: "Invalid categoryId" },
          { status: 400 }
        );
      }
      filters.category = categoryId;
    } else if (categoryName && categoryName.toLowerCase() !== "all") {
      const normalized = normalizeString(categoryName);
      const categories = await Category.find().lean();

      // Tìm category khớp tên (cả normalize và không normalize)
      const matched = categories.find(
        (cat) =>
          normalizeString(cat.name) === normalized ||
          cat.name.toLowerCase() === categoryName.toLowerCase()
      );

      if (!matched) {
        console.warn(
          `Category not found for "${categoryName}" (normalized: "${normalized}"), available categories:`,
          categories.map((cat) => ({
            name: cat.name,
            normalized: normalizeString(cat.name),
          }))
        );
        return NextResponse.json(
          {
            success: false,
            message: `Không tìm thấy danh mục: ${categoryName}`,
          },
          { status: 400 }
        );
      } else {
        filters.category = matched._id;
        console.log(`Found category: ${matched.name} (${matched._id})`);
      }
    }

    // ==== Brand filter ====
    if (brandName) {
      const normalized = normalizeString(brandName);
      const brands = await Brand.find().lean();

      // Tìm brand khớp tên (cả normalize và không normalize)
      const matched = brands.find(
        (br) =>
          normalizeString(br.name) === normalized ||
          br.name.toLowerCase() === brandName.toLowerCase()
      );

      if (!matched) {
        console.warn(
          `Brand not found for "${brandName}" (normalized: "${normalized}"), available brands:`,
          brands.map((brand) => ({
            name: brand.name,
            normalized: normalizeString(brand.name),
          }))
        );
        return NextResponse.json(
          {
            success: false,
            message: `Không tìm thấy thương hiệu: ${brandName}`,
          },
          { status: 400 }
        );
      } else {
        filters.brand = matched._id;
        console.log(`Found brand: ${matched.name} (${matched._id})`);
      }
    }

    // ==== Seller filter ====
    if (userId) {
      // Không cần kiểm tra ObjectId format vì userId có thể là từ Clerk (user_xxx)
      filters.userId = userId;
    } else {
      // Nếu không phải seller request, chỉ hiển thị sản phẩm active
      filters.isActive = { $ne: false };
    }

    // ==== Price filter ====
    // Lưu ý: Vì giá có thể nằm trong variants, ta sẽ filter sau khi populate
    let priceFilter = null;
    if (minPrice > 0 || maxPrice < 100000000) {
      priceFilter = { min: minPrice, max: maxPrice };
    }

    // ==== Query builder ====
    let mongoQuery = { ...filters };
    console.log("Initial filters:", filters);

    if (searchQuery) {
      const searchTerms = splitSearchTerms(searchQuery); // Tách và chuẩn hóa từ khóa
      console.log("Search terms:", searchTerms); // Debug các từ khóa tách ra

      mongoQuery = {
        $and: [
          {
            $or: searchTerms.flatMap((term) => [
              { name: { $regex: term, $options: "i" } },
              { description: { $regex: term, $options: "i" } },
              { keywords: { $regex: term, $options: "i" } },
              { "category.name": { $regex: term, $options: "i" } },
              { "brand.name": { $regex: term, $options: "i" } },
            ]),
          },
          filters,
        ],
      };
    } else if (Object.keys(filters).length > 0) {
      mongoQuery = {
        $and: Object.entries(filters).map(([key, value]) => ({ [key]: value })),
      };
    }

    console.log("MongoDB Query:", mongoQuery);

    // === Fetch products with sorting ===
    const sortOption = {};
    if (sort === "low-to-high") sortOption.offerPrice = 1;
    else if (sort === "high-to-low") sortOption.offerPrice = -1;
    else sortOption.createdAt = -1;

    const products = await Product.find(mongoQuery)
      .select(
        "name description price offerPrice images category stock brand ratings comments keywords variants"
      )
      .populate("category", "name")
      .populate("brand", "name")
      .populate("variants", "name price offerPrice images")
      .skip(skip)
      .limit(limit)
      .lean();

    // Sắp xếp sau khi populate để có thể sử dụng giá từ variants
    if (sort === "low-to-high" || sort === "high-to-low") {
      products.sort((a, b) => {
        const getPriceForSort = (product) => {
          // Ưu tiên offerPrice của product, nếu không có thì lấy từ variant đầu tiên
          if (product.offerPrice && product.offerPrice > 0)
            return product.offerPrice;
          if (product.price && product.price > 0) return product.price;
          if (product.variants && product.variants.length > 0) {
            const firstVariant = product.variants[0];
            return firstVariant.offerPrice || firstVariant.price || 0;
          }
          return 0;
        };

        const priceA = getPriceForSort(a);
        const priceB = getPriceForSort(b);

        return sort === "low-to-high" ? priceA - priceB : priceB - priceA;
      });
    }

    // Filter theo giá sau khi populate và có thể lấy giá từ variants
    let filteredProducts = products;
    if (priceFilter) {
      filteredProducts = products.filter((product) => {
        const getProductPrice = (product) => {
          if (product.offerPrice && product.offerPrice > 0)
            return product.offerPrice;
          if (product.price && product.price > 0) return product.price;
          if (product.variants && product.variants.length > 0) {
            const firstVariant = product.variants[0];
            return firstVariant.offerPrice || firstVariant.price || 0;
          }
          return 0;
        };

        const productPrice = getProductPrice(product);
        return (
          productPrice >= priceFilter.min && productPrice <= priceFilter.max
        );
      });
    }

    // Debug dữ liệu populate
    products.forEach((product) => {
      console.log("Product data:", {
        name: product.name,
        keywords: product.keywords,
        category: product.category?.name,
        brand: product.brand?.name,
      });
    });

    const totalProducts = await Product.countDocuments(mongoQuery);

    const productsWithRating = filteredProducts.map((product) => {
      const averageRating = product.ratings?.length
        ? (
            product.ratings.reduce((sum, r) => sum + r.rating, 0) /
            product.ratings.length
          ).toFixed(1)
        : 0;
      return {
        ...product,
        averageRating,
        ratings: product.ratings || [],
        comments: product.comments || [],
      };
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
    if (error.name === "CastError" || error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid filter parameters: " + error.message,
        },
        { status: 400 }
      );
    }
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
        "name description price offerPrice images category stock brand ratings comments specifications keywords variants"
      )
      .populate("category brand", "name")
      .populate("variants", "name price offerPrice images")
      .populate({
        path: "specifications",
        model: "Specification",
      })
      .lean();

    const productsWithRating = products.map((product) => {
      const averageRating = product.ratings?.length
        ? (
            product.ratings.reduce((sum, review) => sum + review.rating, 0) /
            product.ratings.length
          ).toFixed(1)
        : 0;
      return {
        ...product,
        averageRating,
        ratings: product.ratings || [],
        comments: product.comments || [],
      };
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
