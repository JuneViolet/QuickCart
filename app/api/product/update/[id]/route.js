// import { NextResponse } from "next/server";
// import Product from "@/models/Product";
// import connectDB from "@/config/db";
// import { currentUser } from "@clerk/nextjs/server";
// import Category from "@/models/Category";
// import Brand from "@/models/Brand";

// export async function PUT(request, context) {
//   try {
//     await connectDB();

//     const user = await currentUser();
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const params = await context.params;
//     const { id } = params;
//     console.log("Extracted ID:", id);

//     if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid product ID" },
//         { status: 400 }
//       );
//     }

//     const product = await Product.findById(id);
//     if (!product) {
//       return NextResponse.json(
//         { success: false, message: "Product not found" },
//         { status: 404 }
//       );
//     }

//     if (product.userId !== user.id) {
//       return NextResponse.json(
//         { success: false, message: "Forbidden" },
//         { status: 403 }
//       );
//     }

//     const body = await request.json();
//     console.log("Received body:", body);

//     let { name, description, category, price, offerPrice, stock, brand } = body;

//     // Xử lý categoryName và brandName
//     let categoryName =
//       body.categoryName ||
//       (typeof category === "object" && category?.name) ||
//       "";
//     let brandName =
//       body.brandName || (typeof brand === "object" && brand?.name) || "";

//     // Kiểm tra các trường bắt buộc
//     if (
//       !name ||
//       !description ||
//       !categoryName ||
//       !price ||
//       !offerPrice ||
//       !brandName
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Missing required fields: " +
//             JSON.stringify({
//               name,
//               description,
//               categoryName,
//               price,
//               offerPrice,
//               brandName,
//             }),
//         },
//         { status: 400 }
//       );
//     }

//     const categoryDoc = await Category.findOne({ name: categoryName });
//     const brandDoc = await Brand.findOne({ name: brandName });

//     if (!categoryDoc) {
//       return NextResponse.json(
//         { success: false, message: `Category "${categoryName}" not found` },
//         { status: 404 }
//       );
//     }
//     if (!brandDoc) {
//       return NextResponse.json(
//         { success: false, message: `Brand "${brandName}" not found` },
//         { status: 404 }
//       );
//     }

//     product.name = name;
//     product.description = description;
//     product.category = categoryDoc._id;
//     product.price = parseFloat(price);
//     product.offerPrice = parseFloat(offerPrice);
//     if (stock !== undefined && stock !== "") {
//       product.stock = parseInt(stock);
//       if (isNaN(product.stock)) {
//         return NextResponse.json(
//           { success: false, message: "Invalid stock value" },
//           { status: 400 }
//         );
//       }
//     }
//     if (isNaN(product.price) || isNaN(product.offerPrice)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid numeric values for price or offerPrice",
//         },
//         { status: 400 }
//       );
//     }

//     product.brand = brandDoc._id;
//     await product.save();

//     return NextResponse.json(
//       { success: true, message: "Product updated successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Update Product Error:", error.message, error.stack);
//     return NextResponse.json(
//       { success: false, message: "Failed to update product: " + error.message },
//       { status: 500 }
//     );
//   }
// }
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

export async function PUT(request, context) {
  try {
    await connectDB();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { params } = await context;
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

    if (product.userId !== user.id) {
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
    const newImages = formData
      .getAll("images")
      .filter((file) => file instanceof File);
    const existingImages = formData.getAll("existingImages") || [];

    if (!name || !description || !categoryName || !price || !brandName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: " +
            JSON.stringify({
              name,
              description,
              categoryName,
              price,
              brandName,
            }),
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

    const parsedPrice = parseFloat(price);
    const parsedOfferPrice = parseFloat(offerPrice);

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

    let images = product.images || [];
    if (existingImages.length > 0) {
      images = existingImages;
    }
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
      return NextResponse.json(
        { success: false, message: `Maximum ${maxImages} images allowed` },
        { status: 400 }
      );
    }

    product.name = name;
    product.description = description;
    product.category = categoryDoc._id;
    product.price = parsedPrice;
    product.offerPrice = parsedOfferPrice;
    product.brand = brandDoc._id;
    product.images = images;

    await product.save();

    return NextResponse.json(
      { success: true, message: "Product updated successfully" },
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
