// import connectDB from "@/config/db";
// import authSeller from "@/lib/authSeller";
// import Product from "@/models/Product";
// import { getAuth } from "@clerk/nextjs/server";
// import { v2 as cloudinary } from "cloudinary";
// import { NextResponse } from "next/server";

// // Cấu hình Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function POST(request) {
//   try {
//     await connectDB(); // Kết nối MongoDB trước
//     const { userId } = getAuth(request);
//     const isSeller = await authSeller(userId);

//     if (!isSeller) {
//       return NextResponse.json(
//         { success: false, message: "Not authorized" },
//         { status: 403 }
//       );
//     }

//     const formData = await request.formData();
//     const name = formData.get("name");
//     const description = formData.get("description");
//     const category = formData.get("category");
//     const price = formData.get("price");
//     const offerPrice = formData.get("offerPrice");
//     const files = formData.getAll("images");

//     if (!files || files.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "No files uploaded" },
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
//       userId,
//       name,
//       description,
//       category,
//       price: Number(price),
//       offerPrice: Number(offerPrice),
//       image: images,
//       date: Date.now(),
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Upload successful",
//       newProduct,
//     });
//   } catch (error) {
//     console.error("Error adding product:", error); // Log lỗi
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { currentUser } from "@clerk/nextjs/server"; // Thay getAuth bằng currentUser
import { v2 as cloudinary } from "cloudinary";

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    await connectDB(); // Kết nối MongoDB

    // Kiểm tra người dùng
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please sign in" },
        { status: 401 }
      );
    }

    // Kiểm tra xem user có phải là seller không (thay authSeller)
    // Giả định bạn đã có logic xác định seller trong user metadata
    const isSeller = user?.publicMetadata?.role === "seller"; // Điều chỉnh theo cách bạn lưu role
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Seller role required" },
        { status: 403 }
      );
    }

    // Lấy dữ liệu từ form
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const stock = formData.get("stock"); // Thêm stock
    const brand = formData.get("brand"); // Thêm brand
    const files = formData.getAll("images");

    // Kiểm tra dữ liệu đầu vào
    if (
      !name ||
      !description ||
      !category ||
      !price ||
      !offerPrice ||
      !stock ||
      !brand ||
      !files ||
      files.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Kiểm tra giá trị số
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

    // Upload ảnh lên Cloudinary
    const result = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(buffer);
        });
      })
    );

    const images = result.map((res) => res.secure_url);

    // Thêm sản phẩm vào MongoDB
    const newProduct = await Product.create({
      userId: user.id, // Sử dụng user.id thay vì getAuth
      name,
      description,
      category,
      price: parsedPrice,
      offerPrice: parsedOfferPrice,
      stock: parsedStock, // Lưu stock
      brand, // Lưu brand
      image: images,
      date: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error.message, error.stack); // Cải thiện log
    return NextResponse.json(
      { success: false, message: "Failed to add product: " + error.message },
      { status: 500 }
    );
  }
}
