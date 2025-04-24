import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/models/Product";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Kiểm tra xem query có chứa ít nhất một chữ cái hoặc số không
    if (!/[a-zA-Z0-9]/.test(query)) {
      return NextResponse.json([]); // Trả về mảng rỗng nếu query không hợp lệ
    }

    // Thoát các ký tự đặc biệt trong query để tránh lỗi regex
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const results = await Product.find({
      name: { $regex: escapedQuery, $options: "i" },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
