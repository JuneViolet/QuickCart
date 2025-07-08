import { NextResponse } from "next/server";
import Variant from "@/models/Variants";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please sign in" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const stock = formData.get("stock");
    const sku = formData.get("sku");
    const attributeRefs = JSON.parse(formData.get("attributeRefs") || "[]");
    const productId = formData.get("productId");
    const files = formData.getAll("images");

    if (
      !price ||
      !stock ||
      !sku ||
      !productId ||
      !files ||
      files.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: price, stock, sku, productId, or images",
        },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);
    const parsedOfferPrice = Number(offerPrice);
    const parsedStock = Number(stock);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid price" },
        { status: 400 }
      );
    }
    if (
      parsedOfferPrice &&
      (isNaN(parsedOfferPrice) || parsedOfferPrice <= 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid offer price" },
        { status: 400 }
      );
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid stock" },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found or not owned by you" },
        { status: 404 }
      );
    }

    // Kiểm tra sku trước khi upload ảnh
    const existingVariant = await Variant.findOne({ sku, userId });
    if (existingVariant) {
      return NextResponse.json(
        { success: false, message: `SKU "${sku}" already exists` },
        { status: 400 }
      );
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: "auto" }, (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            })
            .end(buffer);
        });
      })
    ).catch((error) => {
      throw new Error(`Upload image failed: ${error.message}`);
    });

    const images = uploadResults;

    const newVariant = await Variant.create({
      userId,
      productId,
      price: parsedPrice,
      offerPrice: parsedOfferPrice,
      stock: parsedStock,
      sku,
      attributeRefs,
      images,
    });

    await Product.findByIdAndUpdate(productId, {
      $push: { variants: newVariant._id },
    });

    return NextResponse.json({
      success: true,
      message: "Variant added successfully",
      newVariant,
    });
  } catch (error) {
    console.error("Error adding variant:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to add variant: " + error.message },
      { status: 500 }
    );
  }
}
