import connectDB from "@/config/db";
import Brand from "@/models/Brand";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find().select("_id name").lean();
    return NextResponse.json({ success: true, brands });
  } catch (error) {
    console.error("Get Brands Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to fetch brands: " + error.message },
      { status: 500 }
    );
  }
}
