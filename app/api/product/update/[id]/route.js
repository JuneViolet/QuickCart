// import { NextResponse } from "next/server";
// import Product from "@/models/Product";
// import connectDB from "@/config/db";
// import { currentUser } from "@clerk/nextjs/server";

// export async function PUT(request, context) {
//   try {
//     await connectDB();

//     // Kiểm tra người dùng
//     const user = await currentUser();
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Await params để lấy id
//     const { id } = await context.params; // Thêm await ở đây

//     // Kiểm tra ID hợp lệ
//     if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid product ID" },
//         { status: 400 }
//       );
//     }

//     // Tìm sản phẩm
//     const product = await Product.findById(id);
//     if (!product) {
//       return NextResponse.json(
//         { success: false, message: "Product not found" },
//         { status: 404 }
//       );
//     }

//     // Kiểm tra quyền chỉnh sửa
//     if (product.userId !== user.id) {
//       return NextResponse.json(
//         { success: false, message: "Forbidden" },
//         { status: 403 }
//       );
//     }

//     // Lấy dữ liệu từ request
//     const { name, description, category, price, offerPrice, stock, brand } =
//       await request.json();

//     // Kiểm tra dữ liệu đầu vào
//     if (
//       !name ||
//       !description ||
//       !category ||
//       !price ||
//       !offerPrice ||
//       stock === undefined ||
//       !brand
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Cập nhật sản phẩm
//     product.name = name;
//     product.description = description;
//     product.category = category;
//     product.price = parseFloat(price);
//     product.offerPrice = parseFloat(offerPrice);
//     product.stock = parseInt(stock);
//     product.brand = brand;

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

    // Await context.params để lấy id
    const params = await context.params;
    const { id } = params;

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

    // Kiểm tra quyền: Dùng userId thay vì owner
    if (product.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const {
      name,
      description,
      category: categoryName,
      price,
      offerPrice,
      stock,
      brand: brandName,
    } = await request.json();

    // Kiểm tra các trường bắt buộc
    if (
      !name ||
      !description ||
      !categoryName ||
      !price ||
      !offerPrice ||
      stock === undefined ||
      stock === "" ||
      !brandName
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
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

    // Cập nhật sản phẩm
    product.name = name;
    product.description = description;
    product.category = category._id;
    product.price = parseFloat(price);
    product.offerPrice = parseFloat(offerPrice);
    product.stock = parseInt(stock);

    if (
      isNaN(product.price) ||
      isNaN(product.offerPrice) ||
      isNaN(product.stock)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid numeric values for price, offerPrice, or stock",
        },
        { status: 400 }
      );
    }

    product.brand = brand._id;

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
