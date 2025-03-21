// import connectDB from "@/config/db";
// import authSeller from "@/lib/authSeller";
// import Product from "@/models/Product";
// import { getAuth } from "@clerk/nextjs/server";
// import { v2 as cloudinary } from "cloudinary";
// import { NextResponse } from "next/server";

// //configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function POST(request) {
//   try {
//     const { userId } = getAuth(request);

//     const isSeller = await authSeller(userId);

//     if (!isSeller) {
//       return NextResponse.json({ success: false, messages: "not authorized" });
//     }

//     const formData = await request.formData();

//     const name = formData.get("name");
//     const description = formData.get("description");
//     const category = formData.get("category");
//     const price = formData.get("price");
//     const offerPrice = formData.get("offerPrice");

//     const files = formData.getAll("images");

//     if (!files || files.length === 0) {
//       return NextResponse.json({
//         success: false,
//         messages: "no files uploaded",
//       });
//     }

//     const result = await Promise.all(
//       files.map(async () => {
//         const arrayBuffer = await files.arrayBuffer();
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

//     const image = result.map((result) => result.secure_url);

//     await connectDB();
//     const newProduct = await Product.create({
//       userId,
//       name,
//       description,
//       category,
//       price: Number(price),
//       offerPrice: Number(offerPrice),
//       image,
//       date: Date.now(),
//     });

//     return NextResponse.json({
//       success: true,
//       messages: "Upload successful",
//       newProduct,
//     });
//   } catch (error) {
//     return NextResponse.json({ success: false, messages: error.messages });
//   }
// }
import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    await connectDB(); // Kết nối MongoDB trước
    const { userId } = getAuth(request);
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files uploaded" },
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
      userId,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      image: images,
      date: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Upload successful",
      newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error); // Log lỗi
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
