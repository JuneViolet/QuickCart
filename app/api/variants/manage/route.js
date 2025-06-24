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
