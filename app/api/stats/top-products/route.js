// // app/api/stats/top-products/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Order from "@/models/Order";
// import Product from "@/models/Product";

// export const GET = async () => {
//   try {
//     await connectDB();

//     const orders = await Order.find({
//       status: { $in: ["pending", "ghn_success", "paid"] },
//     });

//     const productStats = {};

//     for (const order of orders) {
//       for (const item of order.items) {
//         const productId = item.product.toString();
//         const revenue = item.quantity * item.price;

//         if (!productStats[productId]) {
//           productStats[productId] = {
//             productId,
//             name: "",
//             totalSold: 0,
//             totalRevenue: 0,
//           };
//         }

//         productStats[productId].totalSold += item.quantity;
//         productStats[productId].totalRevenue += revenue;
//       }
//     }

//     // Lấy tên sản phẩm
//     const results = await Promise.all(
//       Object.values(productStats).map(async (stat) => {
//         const product = await Product.findById(stat.productId);
//         if (product) stat.name = product.name;
//         return stat;
//       })
//     );

//     // Trả top 5
//     const topProducts = results
//       .sort((a, b) => b.totalSold - a.totalSold)
//       .slice(0, 5);
//     return NextResponse.json(topProducts);
//   } catch (err) {
//     console.error("Top product stats error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// };
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const GET = async () => {
  try {
    await connectDB();

    const orders = await Order.find({
      status: { $in: ["paid", "shipped", "delivered"] }, // Thêm "delivered" cho đơn giao thành công
    })
      .populate("items.product")
      .populate("items.variantId");

    const productStats = {};

    for (const order of orders) {
      for (const item of order.items) {
        const productId = item.product._id.toString();
        const variant = item.variantId;
        const revenue = (variant?.price || item.price || 0) * item.quantity;

        if (!productStats[productId]) {
          productStats[productId] = {
            productId,
            name: "",
            totalSold: 0,
            totalRevenue: 0,
          };
        }

        productStats[productId].totalSold += item.quantity;
        productStats[productId].totalRevenue += revenue;
      }
    }

    // Lấy tên sản phẩm
    const results = await Promise.all(
      Object.values(productStats).map(async (stat) => {
        const product = await Product.findById(stat.productId);
        if (product) stat.name = product.name;
        return stat;
      })
    );

    // Trả top 5
    const topProducts = results
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);
    return NextResponse.json(topProducts);
  } catch (err) {
    console.error("Top product stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
