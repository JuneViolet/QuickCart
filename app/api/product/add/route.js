// import { NextResponse } from "next/server";
// import Product from "@/models/Product";
// import connectDB from "@/config/db";
// import { currentUser } from "@clerk/nextjs/server"; // Thay getAuth bằng currentUser
// import { v2 as cloudinary } from "cloudinary";

// // Cấu hình Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function POST(request) {
//   try {
//     await connectDB(); // Kết nối MongoDB

//     // Kiểm tra người dùng
//     const user = await currentUser();
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized: Please sign in" },
//         { status: 401 }
//       );
//     }

//     // Kiểm tra xem user có phải là seller không (thay authSeller)
//     // Giả định bạn đã có logic xác định seller trong user metadata
//     const isSeller = user?.publicMetadata?.role === "seller"; // Điều chỉnh theo cách bạn lưu role
//     if (!isSeller) {
//       return NextResponse.json(
//         { success: false, message: "Forbidden: Seller role required" },
//         { status: 403 }
//       );
//     }

//     // Lấy dữ liệu từ form
//     const formData = await request.formData();
//     const name = formData.get("name");
//     const description = formData.get("description");
//     const category = formData.get("category");
//     const price = formData.get("price");
//     const offerPrice = formData.get("offerPrice");
//     const stock = formData.get("stock"); // Thêm stock
//     const brand = formData.get("brand"); // Thêm brand
//     const files = formData.getAll("images");

//     // Kiểm tra dữ liệu đầu vào
//     if (
//       !name ||
//       !description ||
//       !category ||
//       !price ||
//       !offerPrice ||
//       !stock ||
//       !brand ||
//       !files ||
//       files.length === 0
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Kiểm tra giá trị số
//     const parsedPrice = Number(price);
//     const parsedOfferPrice = Number(offerPrice);
//     const parsedStock = Number(stock);

//     if (
//       isNaN(parsedPrice) ||
//       parsedPrice <= 0 ||
//       isNaN(parsedOfferPrice) ||
//       parsedOfferPrice <= 0 ||
//       isNaN(parsedStock) ||
//       parsedStock < 0
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Invalid price, offerPrice, or stock" },
//         { status: 400 }
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
//               if (error) {
//                 reject(error);
//               } else {
//                 resolve(result);
//               }
//             }
//           );
//           stream.end(buffer);
//         });
//       })
//     );

//     const images = result.map((res) => res.secure_url);

//     // Thêm sản phẩm vào MongoDB
//     const newProduct = await Product.create({
//       userId: user.id, // Sử dụng user.id thay vì getAuth
//       name,
//       description,
//       category,
//       price: parsedPrice,
//       offerPrice: parsedOfferPrice,
//       stock: parsedStock, // Lưu stock
//       brand, // Lưu brand
//       image: images,
//       date: Date.now(),
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Product added successfully",
//       newProduct,
//     });
//   } catch (error) {
//     console.error("Error adding product:", error.message, error.stack); // Cải thiện log
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
import Category from "@/models/Category"; // Import Category
import Brand from "@/models/Brand"; // Import Brand

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
    const categoryName = formData.get("category"); // Nhận name thay vì _id
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const stock = formData.get("stock");
    const brandName = formData.get("brand"); // Nhận name thay vì _id
    const files = formData.getAll("images");

    if (
      !name ||
      !description ||
      !categoryName ||
      !price ||
      !offerPrice ||
      !stock ||
      !brandName ||
      !files ||
      files.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);
    const parsedOfferPrice = Number(offerPrice);
    const parsedStock = Number(stock);

    if (
      isNaN(parsedPrice) ||
      parsedPrice <= 0 ||
      isNaN(parsedOfferPrice) ||
      parsedOfferPrice <= 0 ||
      isNaN(parsedStock) ||
      parsedStock < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid price, offerPrice, or stock" },
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
      category: category._id, // Sử dụng _id của Category
      price: parsedPrice,
      offerPrice: parsedOfferPrice,
      stock: parsedStock,
      brand: brand._id, // Sử dụng _id của Brand
      images,
      date: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
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
