import connectDB from "@/config/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().select("_id name").lean();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Get Categories Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories: " + error.message },
      { status: 500 }
    );
  }
}