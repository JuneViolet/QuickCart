// // app/api/stats/category/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Order from "@/models/Order";
// import Product from "@/models/Product";
// import Category from "@/models/Category"; // <-- nhớ import nếu cần

// export const GET = async () => {
//   try {
//     await connectDB();

//     // Lấy tất cả đơn hàng đã hoàn tất / đã thanh toán
//     const orders = await Order.find({
//       status: { $in: ["paid", "delivered", "Đã giao"] },
//     }).populate("items.product");

//     const categoryCount = {};

//     for (const order of orders) {
//       for (const item of order.items) {
//         const product = item.product;

//         if (!product || !product.category) continue;

//         const populatedProduct = await Product.findById(product._id).populate(
//           "category"
//         );

//         const categoryName = populatedProduct?.category?.name;
//         if (!categoryName) continue;

//         categoryCount[categoryName] =
//           (categoryCount[categoryName] || 0) + item.quantity;
//       }
//     }

//     const categoryPrice = {};

//     const result = Object.entries(categoryCount).map(
//       ([category, totalSold]) => ({
//         category,
//         totalSold,
//       })
//     );

//     return NextResponse.json(result);
//   } catch (err) {
//     console.error("Error in category stats:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// };
// app/api/stats/category/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const GET = async () => {
  try {
    await connectDB();

    // Lấy các đơn hàng đã thanh toán/thành công
    const orders = await Order.find({
      status: { $in: ["pending", "ghn_success", "paid"] },
    })
      .populate("items.product")
      .populate("items.variantId");

    const categoryStats = {};

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product;
        const variant = item.variantId;

        if (!product || !product.category) continue;

        const populatedProduct = await Product.findById(product._id).populate(
          "category"
        );
        const categoryName = populatedProduct?.category?.name;
        if (!categoryName) continue;

        const quantity = item.quantity;
        const price = variant?.price ?? 0;
        const totalPrice = price * quantity;

        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = {
            category: categoryName,
            totalSold: 0,
            totalRevenue: 0,
          };
        }

        categoryStats[categoryName].totalSold += quantity;
        categoryStats[categoryName].totalRevenue += totalPrice;
      }
    }

    const result = Object.values(categoryStats);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in category stats:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
