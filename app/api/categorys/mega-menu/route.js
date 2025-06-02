// // api/category/mega-menu/route.js
// import connectDB from "@/config/db";
// import Category from "@/models/Category";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     await connectDB();
//     const categories = await Category.find()
//       .populate("Brand") // Nếu dùng ref với Brand, thay "subcategories" bằng "Brand"
//       .lean();
//     return NextResponse.json({ success: true, categories });
//   } catch (error) {
//     console.error(
//       "Get Mega Menu Categories Error:",
//       error.message,
//       error.stack
//     );
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch categories: " + error.message,
//       },
//       { status: 500 }
//     );
//   }
// }
// app/api/category/mega-menu/route.js
// app/api/categorys/mega-menu/route.js
// app/api/categorys/mega-menu/route.js
// app/api/categorys/mega-menu/route.js
import connectDB from "@/config/db";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import BrandCategory from "@/models/BrandCategory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().lean();
    for (let category of categories) {
      const brandCategories = await BrandCategory.find({
        categoryId: category._id,
      }).populate("brandId");
      category.subcategories = brandCategories.map((bc) => bc.brandId);
    }
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error(
      "Get Mega Menu Categories Error:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories: " + error.message,
      },
      { status: 500 }
    );
  }
}
