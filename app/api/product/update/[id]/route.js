import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { currentUser } from "@clerk/nextjs/server";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    const { id } = params;
    console.log("Extracted ID:", id);

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.userId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    console.log("Received formData:", Object.fromEntries(formData));

    const name = formData.get("name");
    const description = formData.get("description");
    const categoryName = formData.get("categoryName");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const brandName = formData.get("brandName");
    const keywords = formData.get("keywords"); // Thêm keywords
    const newImages = formData
      .getAll("images")
      .filter((file) => file instanceof File);
    const existingImages = formData.getAll("existingImages") || [];

    // Kiểm tra các trường bắt buộc (bỏ price vì giờ nằm ở variants)
    if (!name || !description || !categoryName || !brandName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: name, description, categoryName, brandName",
        },
        { status: 400 }
      );
    }

    const categoryDoc = await Category.findOne({ name: categoryName });
    const brandDoc = await Brand.findOne({ name: brandName });

    if (!categoryDoc) {
      return NextResponse.json(
        { success: false, message: `Category "${categoryName}" not found` },
        { status: 404 }
      );
    }
    if (!brandDoc) {
      return NextResponse.json(
        { success: false, message: `Brand "${brandName}" not found` },
        { status: 404 }
      );
    }

    // Bỏ validation cho price và offerPrice vì chúng nằm ở variants
    // const parsedPrice = parseFloat(price);
    // if (isNaN(parsedPrice) || parsedPrice <= 0) {
    //   return NextResponse.json(
    //     { success: false, message: "Invalid price" },
    //     { status: 400 }
    //   );
    // }

    // const parsedOfferPrice = offerPrice ? parseFloat(offerPrice) : undefined;
    // if (
    //   parsedOfferPrice !== undefined &&
    //   (isNaN(parsedOfferPrice) || parsedOfferPrice <= 0)
    // ) {
    //   return NextResponse.json(
    //     { success: false, message: "Invalid offer price" },
    //     { status: 400 }
    //   );
    // }

    // Xử lý keywords
    let keywordArray = [];
    if (keywords) {
      keywordArray = keywords
        .split(/[, ]+/)
        .filter((keyword) => keyword.trim())
        .map((keyword) => keyword.trim());
    }

    // Xử lý hình ảnh
    let images =
      existingImages.length > 0 ? existingImages : product.images || [];
    const maxImages = 4;
    if (newImages.length > 0) {
      const uploadResults = await Promise.all(
        newImages.map(async (file) => {
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
      images = [...images, ...uploadResults];
    }

    if (images.length > maxImages) {
      images = images.slice(0, maxImages); // Giới hạn số lượng ảnh
    }

    // Cập nhật sản phẩm (bỏ price và offerPrice vì chúng nằm ở variants)
    product.name = name;
    product.description = description;
    product.category = categoryDoc._id;
    // product.price = parsedPrice;
    // product.offerPrice = parsedOfferPrice;
    product.brand = brandDoc._id;
    product.images = images;
    product.keywords = keywordArray; // Cập nhật keywords

    await product.save();

    // Trả về sản phẩm đã cập nhật
    const updatedProduct = await Product.findById(id).populate(
      "category brand",
      "name"
    );
    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Product Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to update product: " + error.message },
      { status: 500 }
    );
  }
}
