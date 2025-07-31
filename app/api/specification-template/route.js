import connectDB from "@/config/db";
import SpecificationTemplate from "@/models/SpecificationTemplate";
import { NextResponse } from "next/server";

// GET: Lấy danh sách tất cả templates hoặc theo categoryId
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    let query = {};
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const templates = await SpecificationTemplate.find(query).lean();
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error(
      "Get SpecificationTemplates Error:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST: Thêm hoặc cập nhật template cho một danh mục
export async function POST(request) {
  try {
    await connectDB();
    const { categoryId, specs } = await request.json();

    if (!categoryId || !specs || !Array.isArray(specs)) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Kiểm tra xem template đã tồn tại chưa, nếu có thì cập nhật
    const existingTemplate = await SpecificationTemplate.findOne({
      categoryId,
    });
    if (existingTemplate) {
      return NextResponse.json(
        {
          success: false,
          message: "Template đã tồn tại trong danh mục này",
        },
        { status: 409 }
      );
    }

    const specName = specs.map((spec) => spec.name.toLowerCase().trim());
    const duplicateName = specName.filter(
      (name, index) => specName.indexOf(name) !== index
    );
    if (duplicateName.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Tên thông số không được trùng lặp: ${duplicateName.join(
            ","
          )}`,
        },
        { status: 400 }
      );
    }

    const emptyName = specs.filter((spec) => !spec.name || !spec.name.trim());
    if (emptyName.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tên thông được để trống",
        },
        { status: 400 }
      );
    }
    // Nếu chưa có, tạo mới
    const newTemplate = await SpecificationTemplate.create({
      categoryId,
      specs,
    });
    return NextResponse.json({
      success: true,
      message: "Template created successfully",
      template: newTemplate,
    });
  } catch (error) {
    console.error(
      "Post SpecificationTemplate Error:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật template
export async function PUT(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const { specs } = await request.json();

    if (!categoryId || !specs || !Array.isArray(specs)) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const template = await SpecificationTemplate.findOne({ categoryId });
    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    template.specs = specs;
    await template.save();

    return NextResponse.json({
      success: true,
      message: "Template updated successfully",
      template,
    });
  } catch (error) {
    console.error(
      "Put SpecificationTemplate Error:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Xóa template
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Missing categoryId" },
        { status: 400 }
      );
    }

    const result = await SpecificationTemplate.findOneAndDelete({ categoryId });
    if (!result) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete SpecificationTemplate Error:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
