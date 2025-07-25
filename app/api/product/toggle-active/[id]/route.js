import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Kiểm tra vai trò seller
    const isSeller = user?.publicMetadata?.role === "seller";
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Seller role required" },
        { status: 403 }
      );
    }

    const { id } = params;
    const { isActive } = await request.json();

    // Kiểm tra sản phẩm có tồn tại và thuộc về seller hiện tại
    const product = await Product.findOne({ _id: id, userId: user.id });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Sản phẩm không tồn tại hoặc bạn không có quyền chỉnh sửa",
        },
        { status: 404 }
      );
    }

    // Cập nhật trạng thái isActive
    await Product.findByIdAndUpdate(id, {
      isActive: isActive,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: isActive
        ? "Sản phẩm đã được kích hoạt thành công"
        : "Sản phẩm đã được tạm dừng hoạt động",
    });
  } catch (error) {
    console.error("Toggle Product Active Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to toggle product status: " + error.message,
      },
      { status: 500 }
    );
  }
}
