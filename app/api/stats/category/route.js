// // app/api/stats/category/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Order from "@/models/Order";
// import Product from "@/models/Product";

// export const GET = async () => {
//   try {
//     await connectDB();

//     // Sử dụng trạng thái tiếng Anh từ database
//     const orders = await Order.find({
//       status: { $in: ["paid", "shipped"] }, // Thêm "delivered" nếu có
//     })
//       .populate("items.product")
//       .populate("items.variantId");

//     const categoryStats = {};

//     for (const order of orders) {
//       for (const item of order.items) {
//         const product = item.product;
//         const variant = item.variantId;

//         if (!product || !product.category) continue;

//         const populatedProduct = await Product.findById(product._id).populate(
//           "category"
//         );
//         const categoryName = populatedProduct?.category?.name;
//         if (!categoryName) continue;

//         const quantity = item.quantity;
//         const price = variant?.price ?? 0;
//         const totalPrice = price * quantity;

//         if (!categoryStats[categoryName]) {
//           categoryStats[categoryName] = {
//             category: categoryName,
//             totalSold: 0,
//             totalRevenue: 0,
//           };
//         }

//         categoryStats[categoryName].totalSold += quantity;
//         categoryStats[categoryName].totalRevenue += totalPrice;
//       }
//     }

//     const result = Object.values(categoryStats);
//     console.log("Category Stats:", result); // Debug
//     return NextResponse.json(result);
//   } catch (err) {
//     console.error("Error in category stats:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// };
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const GET = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categoryFilter = searchParams.get("category");

    const matchQuery = {
      status: { $in: ["paid", "shipped", "delivered"] }, // Thêm "delivered" cho đơn giao thành công
    };

    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"), // Đến cuối ngày
      };
    }

    const pipeline = [
      { $match: matchQuery },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products", // Collection products
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "categories", // Collection categories
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },

      // Filter theo category nếu có
      ...(categoryFilter
        ? [{ $match: { "categoryDetails.name": categoryFilter } }]
        : []),

      {
        $lookup: {
          from: "variants", // Collection variants (xác nhận tên này)
          localField: "items.variantId",
          foreignField: "_id",
          as: "variantDetails",
        },
      },
      { $unwind: "$variantDetails" },
      {
        $group: {
          _id: "$categoryDetails.name",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: [
                "$items.quantity",
                { $ifNull: ["$variantDetails.offerPrice", 0] },
              ],
            },
          },
        },
      },
      {
        $project: {
          category: "$_id",
          totalSold: 1,
          totalRevenue: 1,
          _id: 0,
        },
      },
    ];

    const categoryStats = await Order.aggregate(pipeline);

    // Debug: Kiểm tra dữ liệu
    console.log("Category Stats:", categoryStats);
    if (categoryStats.length > 0) {
      categoryStats.forEach((stat) => {
        console.log(
          `Category: ${stat.category}, Total Sold: ${stat.totalSold}, Total Revenue: ${stat.totalRevenue}`
        );
      });
    } else {
      console.log("No data found.");
    }

    return NextResponse.json(categoryStats.length > 0 ? categoryStats : []);
  } catch (err) {
    console.error("Error in category stats:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
