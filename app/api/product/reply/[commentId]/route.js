import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";

// UPDATE reply
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { commentId } = params;
    const { productId, reply } = await request.json();

    if (!productId || !reply?.trim()) {
      return NextResponse.json(
        { success: false, message: "Product ID và reply đều là bắt buộc" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy sản phẩm" },
        { status: 404 }
      );
    }

    // Kiểm tra xem user có phải là owner của sản phẩm không
    if (product.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Bạn không có quyền chỉnh sửa phản hồi này",
        },
        { status: 403 }
      );
    }

    // Tìm comment và cập nhật reply
    const commentIndex = product.comments.findIndex(
      (c) => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy bình luận" },
        { status: 404 }
      );
    }

    product.comments[commentIndex].reply = reply.trim();
    product.comments[commentIndex].replyDate = new Date();
    product.comments[commentIndex].replyUpdated = true;

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật phản hồi thành công!",
    });
  } catch (error) {
    console.error("Update reply error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE reply
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { commentId } = params;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID là bắt buộc" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy sản phẩm" },
        { status: 404 }
      );
    }

    // Kiểm tra xem user có phải là owner của sản phẩm không
    if (product.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền xóa phản hồi này" },
        { status: 403 }
      );
    }

    // Tìm comment và xóa reply
    const commentIndex = product.comments.findIndex(
      (c) => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy bình luận" },
        { status: 404 }
      );
    }

    product.comments[commentIndex].reply = undefined;
    product.comments[commentIndex].replyDate = undefined;
    product.comments[commentIndex].replyUpdated = undefined;

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Đã xóa phản hồi thành công!",
    });
  } catch (error) {
    console.error("Delete reply error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}
