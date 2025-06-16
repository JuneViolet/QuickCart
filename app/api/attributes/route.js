import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Attribute from "@/models/Attribute";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Giả sử bạn có middleware để kiểm tra quyền (chỉ admin/seller)
    const attributes = await Attribute.find().limit(100); // Giới hạn để tránh tải quá nhiều
    return NextResponse.json({ success: true, attributes }, { status: 200 });
  } catch (error) {
    console.error("Get Attributes Error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch attributes: " + error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, values } = body;

    if (!name || !Array.isArray(values) || values.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid attribute data" },
        { status: 400 }
      );
    }

    const newAttribute = new Attribute({ name, values });
    await newAttribute.save();

    return NextResponse.json(
      {
        success: true,
        message: "Thêm thuộc tính thành công",
        attribute: newAttribute,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add Attribute Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to add attribute: " + error.message },
      { status: 500 }
    );
  }
}
