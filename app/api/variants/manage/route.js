import { NextResponse } from "next/server";
import Variant from "@/models/Variants";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server"; // Import getAuth từ Clerk

export async function GET(request) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const variants = await Variant.find({ userId }).populate(
      "productId",
      "name"
    );
    return NextResponse.json({ success: true, variants }, { status: 200 });
  } catch (error) {
    console.error("Get Variants Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to fetch variants: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, attributeRefs, price, offerPrice, stock, sku, image } =
      body;

    const existingVariant = await Variant.findOne({
      productId,
      userId,
      attributeRefs: {
        $all: attributeRefs.map((ref) => ({
          attributeId: ref.attributeId,
          value: ref.value,
        })),
      },
    });
    if (existingVariant) {
      return NextResponse.json(
        { success: false, message: "Biến thể này đã tồn tại" },
        { status: 400 }
      );
    }

    const newVariant = new Variant({
      productId,
      userId,
      attributeRefs,
      price,
      offerPrice,
      stock,
      sku,
      image,
    });
    await newVariant.save();

    await Product.findByIdAndUpdate(productId, {
      $push: { variants: newVariant._id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thêm biến thể thành công",
        variant: newVariant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add Variant Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to add variant: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, attributeRefs, price, offerPrice, stock, sku, image } =
      body;

    const updatedVariant = await Variant.findOneAndUpdate(
      {
        productId,
        userId,
        attributeRefs: {
          $all: attributeRefs.map((ref) => ({
            attributeId: ref.attributeId,
            value: ref.value,
          })),
        },
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

export async function DELETE(request) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { variantId } = await request.json();
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
