import { NextResponse } from "next/server";
import Variant from "@/models/Variants";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { variantId } = params;
    const body = await request.json();
    const { price, offerPrice, stock, sku, image } = body;

    const updatedVariant = await Variant.findOneAndUpdate(
      {
        _id: variantId,
        userId,
      },
      { price, offerPrice, stock, sku, image },
      { new: true, runValidators: true }
    );

    if (!updatedVariant) {
      return NextResponse.json(
        { success: false, message: "Biến thể không tồn tại" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật biến thể thành công",
        variant: updatedVariant,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Variant Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to update variant: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { variantId } = params;
    const deletedVariant = await Variant.findOneAndDelete({
      _id: variantId,
      userId,
    });

    if (!deletedVariant) {
      return NextResponse.json(
        {
          success: false,
          message: "Biến thể không tồn tại hoặc không thuộc về bạn",
        },
        { status: 404 }
      );
    }

    await Product.findByIdAndUpdate(deletedVariant.productId, {
      $pull: { variants: deletedVariant._id },
    });

    return NextResponse.json(
      { success: true, message: "Xóa biến thể thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Variant Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to delete variant: " + error.message },
      { status: 500 }
    );
  }
}
