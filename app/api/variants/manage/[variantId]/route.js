// import { NextResponse } from "next/server";
// import Variant from "@/models/Variants";
// import Product from "@/models/Product";
// import connectDB from "@/config/db";
// import { getAuth } from "@clerk/nextjs/server";
// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function PUT(request, context) {
//   try {
//     await connectDB();
//     const { userId } = getAuth(request);
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Await context to get params
//     const { params } = await context;
//     const { variantId } = params; // Destructure after awaiting

//     const formData = await request.formData();
//     const price = formData.get("price");
//     const offerPrice = formData.get("offerPrice");
//     const stock = formData.get("stock");
//     const sku = formData.get("sku");
//     const attributeRefs = JSON.parse(formData.get("attributeRefs") || "[]");
//     const newImages = formData
//       .getAll("images")
//       .filter((file) => file instanceof File);
//     const existingImages = formData.getAll("existingImages") || []; // Handle existing images

//     if (!price || !stock || !sku) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const parsedPrice = Number(price);
//     const parsedOfferPrice = Number(offerPrice);
//     const parsedStock = Number(stock);

//     if (isNaN(parsedPrice) || parsedPrice <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid price" },
//         { status: 400 }
//       );
//     }
//     if (
//       parsedOfferPrice &&
//       (isNaN(parsedOfferPrice) || parsedOfferPrice <= 0)
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Invalid offer price" },
//         { status: 400 }
//       );
//     }
//     if (isNaN(parsedStock) || parsedStock < 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid stock" },
//         { status: 400 }
//       );
//     }

//     const existingVariant = await Variant.findOne({ _id: variantId, userId });
//     if (!existingVariant) {
//       return NextResponse.json(
//         { success: false, message: "Biến thể không tồn tại" },
//         { status: 404 }
//       );
//     }

//     let images = [...existingImages]; // Start with existing images
//     const maxImages = 4;
//     if (newImages.length > 0) {
//       const uploadResults = await Promise.all(
//         newImages.map(async (file) => {
//           const arrayBuffer = await file.arrayBuffer();
//           const buffer = Buffer.from(arrayBuffer);
//           return new Promise((resolve, reject) => {
//             cloudinary.uploader
//               .upload_stream({ resource_type: "auto" }, (error, result) => {
//                 if (error) reject(error);
//                 else resolve(result.secure_url);
//               })
//               .end(buffer);
//           });
//         })
//       ).catch((error) => {
//         throw new Error(`Upload image failed: ${error.message}`);
//       });
//       images = [...images, ...uploadResults];
//     }

//     if (images.length > maxImages) {
//       return NextResponse.json(
//         { success: false, message: `Maximum ${maxImages} images allowed` },
//         { status: 400 }
//       );
//     }

//     const updatedVariant = await Variant.findOneAndUpdate(
//       { _id: variantId, userId },
//       {
//         price: parsedPrice,
//         offerPrice: parsedOfferPrice,
//         stock: parsedStock,
//         sku,
//         attributeRefs,
//         images,
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedVariant) {
//       return NextResponse.json(
//         { success: false, message: "Biến thể không tồn tại" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Cập nhật biến thể thành công",
//         variant: updatedVariant,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Update Variant Error:", error.message, error.stack);
//     return NextResponse.json(
//       { success: false, message: "Failed to update variant: " + error.message },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request, context) {
//   try {
//     await connectDB();
//     const { userId } = getAuth(request);
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { params } = await context;
//     const { variantId } = params;
//     const deletedVariant = await Variant.findOneAndDelete({
//       _id: variantId,
//       userId,
//     });

//     if (!deletedVariant) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Biến thể không tồn tại hoặc không thuộc về bạn",
//         },
//         { status: 404 }
//       );
//     }

//     await Product.findByIdAndUpdate(deletedVariant.productId, {
//       $pull: { variants: deletedVariant._id },
//     });

//     return NextResponse.json(
//       { success: true, message: "Xóa biến thể thành công" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Delete Variant Error:", error.message, error.stack);
//     return NextResponse.json(
//       { success: false, message: "Failed to delete variant: " + error.message },
//       { status: 500 }
//     );
//   }
// }
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

export async function PUT(request, context) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { params } = await context;
    const { variantId } = params;

    const formData = await request.formData();
    console.log("Received formData:", Object.fromEntries(formData)); // Debug
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const stock = formData.get("stock");
    const sku = formData.get("sku");
    const attributeRefs = JSON.parse(formData.get("attributeRefs") || "[]");
    const newImages = formData
      .getAll("images")
      .filter((file) => file instanceof File);
    const existingImages = formData.getAll("existingImages") || []; // From client

    if (!price || !stock || !sku) {
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

    const existingVariant = await Variant.findOne({ _id: variantId, userId });
    if (!existingVariant) {
      return NextResponse.json(
        { success: false, message: "Biến thể không tồn tại" },
        { status: 404 }
      );
    }

    // Use existing images from DB if client doesn't send full list
    let images = existingVariant.images || [];
    if (existingImages.length > 0) {
      images = existingImages; // Override with client-sent existing images
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

    const updatedVariant = await Variant.findOneAndUpdate(
      { _id: variantId, userId },
      {
        price: parsedPrice,
        offerPrice: parsedOfferPrice,
        stock: parsedStock,
        sku,
        attributeRefs,
        images,
      },
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

export async function DELETE(request, context) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { params } = await context;
    const { variantId } = params;
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
