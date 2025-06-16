import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Attribute from "@/models/Attribute";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const attribute = await Attribute.findById(id);

    if (!attribute) {
      return NextResponse.json(
        { success: false, message: "Thuộc tính không tồn tại" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, attribute }, { status: 200 });
  } catch (error) {
    console.error("Get Attribute by ID Error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch attribute: " + error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, values } = body;

    if (!name || !Array.isArray(values) || values.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid attribute data" },
        { status: 400 }
      );
    }

    const updatedAttribute = await Attribute.findByIdAndUpdate(
      id,
      { name, values },
      { new: true, runValidators: true }
    );

    if (!updatedAttribute) {
      return NextResponse.json(
        { success: false, message: "Thuộc tính không tồn tại" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật thuộc tính thành công",
        attribute: updatedAttribute,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Attribute Error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update attribute: " + error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const deletedAttribute = await Attribute.findByIdAndDelete(id);

    if (!deletedAttribute) {
      return NextResponse.json(
        { success: false, message: "Thuộc tính không tồn tại" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Xóa thuộc tính thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Attribute Error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete attribute: " + error.message,
      },
      { status: 500 }
    );
  }
}
