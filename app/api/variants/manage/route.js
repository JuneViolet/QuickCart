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

    const formData = await request.formData();
    const productId = formData.get("productId");
    const attributeRefs = JSON.parse(formData.get("attributeRefs") || "[]");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const stock = formData.get("stock");
    const sku = formData.get("sku");
    const files = formData.getAll("images");

    if (!productId || !price || !stock || !sku) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
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

    let images = [];
    const maxImages = 4;
    if (files.length > 0) {
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
      images = uploadResults;
    }

    if (images.length > maxImages) {
      return NextResponse.json(
        { success: false, message: `Maximum ${maxImages} images allowed` },
        { status: 400 }
      );
    }

    const newVariant = new Variant({
      productId,
      userId,
      attributeRefs,
      price: parsedPrice,
      offerPrice: parsedOfferPrice,
      stock: parsedStock,
      sku,
      images,
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
