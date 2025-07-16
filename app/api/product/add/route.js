// import { NextResponse } from "next/server";
// import Product from "@/models/Product";
// import connectDB from "@/config/db";
// import { currentUser } from "@clerk/nextjs/server";
// import { v2 as cloudinary } from "cloudinary";
// import Category from "@/models/Category";
// import Brand from "@/models/Brand";

// // Cấu hình Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function POST(request) {
//   try {
//     await connectDB();

//     const user = await currentUser();
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized: Please sign in" },
//         { status: 401 }
//       );
//     }

//     const isSeller = user?.publicMetadata?.role === "seller";
//     if (!isSeller) {
//       return NextResponse.json(
//         { success: false, message: "Forbidden: Seller role required" },
//         { status: 403 }
//       );
//     }

//     const formData = await request.formData();
//     const name = formData.get("name");
//     const description = formData.get("description");
//     const categoryName = formData.get("category");
//     const price = formData.get("price");
//     const offerPrice = formData.get("offerPrice");
//     const brandName = formData.get("brand");
//     const files = formData.getAll("images");

//     // Kiểm tra các trường bắt buộc
//     if (
//       !name ||
//       !description ||
//       !categoryName ||
//       !brandName ||
//       !files ||
//       files.length === 0
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Missing required fields: name, description, category, brand, or images",
//         },
//         { status: 400 }
//       );
//     }

//     // Chuyển đổi price và offerPrice thành số, nếu có
//     const parsedPrice = price ? Number(price) : undefined;
//     const parsedOfferPrice = offerPrice ? Number(offerPrice) : undefined;

//     // Validate price và offerPrice nếu được cung cấp
//     if (parsedPrice !== undefined && (isNaN(parsedPrice) || parsedPrice <= 0)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid price" },
//         { status: 400 }
//       );
//     }
//     if (
//       parsedOfferPrice !== undefined &&
//       (isNaN(parsedOfferPrice) || parsedOfferPrice <= 0)
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Invalid offer price" },
//         { status: 400 }
//       );
//     }

//     // Tìm _id của Category và Brand dựa trên name
//     const category = await Category.findOne({ name: categoryName });
//     const brand = await Brand.findOne({ name: brandName });

//     if (!category) {
//       return NextResponse.json(
//         { success: false, message: `Category "${categoryName}" not found` },
//         { status: 404 }
//       );
//     }
//     if (!brand) {
//       return NextResponse.json(
//         { success: false, message: `Brand "${brandName}" not found` },
//         { status: 404 }
//       );
//     }

//     // Upload ảnh lên Cloudinary
//     const result = await Promise.all(
//       files.map(async (file) => {
//         const arrayBuffer = await file.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);

//         return new Promise((resolve, reject) => {
//           const stream = cloudinary.uploader.upload_stream(
//             { resource_type: "auto" },
//             (error, result) => {
//               if (error) reject(error);
//               else resolve(result);
//             }
//           );
//           stream.end(buffer);
//         });
//       })
//     );

//     const images = result.map((res) => res.secure_url);

//     // Thêm sản phẩm vào MongoDB
//     const newProduct = await Product.create({
//       userId: user.id,
//       name,
//       description,
//       category: category._id,
//       price: parsedPrice, // Tùy chọn
//       offerPrice: parsedOfferPrice, // Tùy chọn
//       brand: brand._id,
//       images,
//       variants: [], // Khởi tạo mảng rỗng cho variants
//       createdAt: Date.now(), // Thêm createdAt nếu cần (tùy thuộc schema)
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Product added successfully",
//       newProduct,
//     });
//   } catch (error) {
//     console.error("Error adding product:", error.message, error.stack);
//     return NextResponse.json(
//       { success: false, message: "Failed to add product: " + error.message },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { currentUser } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    await connectDB();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please sign in" },
        { status: 401 }
      );
    }

    const isSeller = user?.publicMetadata?.role === "seller";
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Seller role required" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const categoryName = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const brandName = formData.get("brand");
    const keywords = formData.get("keywords"); // Lấy trường keywords
    const files = formData.getAll("images");

    // Kiểm tra các trường bắt buộc
    if (
      !name ||
      !description ||
      !categoryName ||
      !brandName ||
      !files ||
      files.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: name, description, category, brand, or images",
        },
        { status: 400 }
      );
    }

    // Chuyển đổi price và offerPrice thành số, nếu có
    const parsedPrice = price ? Number(price) : undefined;
    const parsedOfferPrice = offerPrice ? Number(offerPrice) : undefined;

    // Validate price và offerPrice nếu được cung cấp
    if (parsedPrice !== undefined && (isNaN(parsedPrice) || parsedPrice <= 0)) {
      return NextResponse.json(
        { success: false, message: "Invalid price" },
        { status: 400 }
      );
    }
    if (
      parsedOfferPrice !== undefined &&
      (isNaN(parsedOfferPrice) || parsedOfferPrice <= 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid offer price" },
        { status: 400 }
      );
    }

    // Tìm _id của Category và Brand dựa trên name
    const category = await Category.findOne({ name: categoryName });
    const brand = await Brand.findOne({ name: brandName });

    if (!category) {
      return NextResponse.json(
        { success: false, message: `Category "${categoryName}" not found` },
        { status: 404 }
      );
    }
    if (!brand) {
      return NextResponse.json(
        { success: false, message: `Brand "${brandName}" not found` },
        { status: 404 }
      );
    }

    // Xử lý keywords (chuyển từ chuỗi JSON thành mảng nếu có)
    let keywordArray = [];
    try {
      if (keywords) {
        keywordArray = JSON.parse(keywords); // Giả định frontend gửi mảng dưới dạng JSON
        if (!Array.isArray(keywordArray)) {
          throw new Error("Keywords must be an array");
        }
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid keywords format" },
        { status: 400 }
      );
    }

    // Upload ảnh lên Cloudinary
    const result = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });
      })
    );

    const images = result.map((res) => res.secure_url);

    // Thêm sản phẩm vào MongoDB
    const newProduct = await Product.create({
      userId: user.id,
      name,
      description,
      category: category._id,
      price: parsedPrice,
      offerPrice: parsedOfferPrice,
      brand: brand._id,
      images,
      keywords: keywordArray, // Thêm trường keywords
      variants: [], // Khởi tạo mảng rỗng cho variants
      createdAt: Date.now(), // Thêm createdAt nếu cần (tùy thuộc schema)
    });

    return NextResponse.json({
      success: true,
      message: "Thêm sản phẩm thành công",
      newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to add product: " + error.message },
      { status: 500 }
    );
  }
}
