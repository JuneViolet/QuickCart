import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const { commentId, response } = await req.json();
    if (!commentId || !response)
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );

    const product = await Product.findOne({ "comments._id": commentId });
    if (!product)
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 }
      );

    const comment = product.comments.id(commentId);
    if (!comment)
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 }
      );

    comment.adminResponse = response;
    comment.adminResponseDate = new Date();
    await product.save();

    return NextResponse.json({ success: true, message: "Response added" });
  } catch (error) {
    console.error("Error in admin response:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
