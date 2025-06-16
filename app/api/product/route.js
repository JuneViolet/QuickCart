import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const query = categoryId ? { category: categoryId } : {};
    const products = await Product.find(query).select("name _id");
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error("Get Products Error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
