// //api/stats/summary
// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Order from "@/models/Order";
// import Product from "@/models/Product";
// import Variant from "@/models/Variants";

// export const GET = async () => {
//   try {
//     await connectDB();

//     const totalOrders = await Order.countDocuments({
//       status: { $in: ["paid", "shipped"] }, // Thêm "delivered" nếu có
//     });

//     const totalRevenueAgg = await Order.aggregate([
//       {
//         $match: {
//           status: { $in: ["paid", "shipped"] }, // Thêm "delivered" nếu có
//         },
//       },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);
//     const totalRevenue = totalRevenueAgg[0]?.total || 0;

//     const totalProducts = await Product.countDocuments();
//     const totalVariants = await Variant.countDocuments();

//     const soldAgg = await Order.aggregate([
//       {
//         $match: {
//           status: { $in: ["paid", "shipped"] }, // Thêm "delivered" nếu có
//         },
//       },
//       { $unwind: "$items" },
//       {
//         $group: {
//           _id: null,
//           totalSoldProducts: { $sum: "$items.quantity" },
//         },
//       },
//     ]);
//     const totalSoldProducts = soldAgg[0]?.totalSoldProducts || 0;

//     console.log("Summary Data:", {
//       totalOrders,
//       totalRevenue,
//       totalSoldProducts,
//     });

//     return NextResponse.json({
//       totalOrders,
//       totalRevenue,
//       totalProducts,
//       totalVariants,
//       totalSoldProducts,
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server Error" }, { status: 500 });
//   }
// };
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Variant from "@/models/Variants";

export const GET = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query = {
      status: { $in: ["paid", "shipped", "delivered"] }, // Thêm "delivered" cho đơn giao thành công
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    const totalOrders = await Order.countDocuments(query);

    const totalRevenueAgg = await Order.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const totalProducts = await Product.countDocuments();
    const totalVariants = await Variant.countDocuments();

    const soldAgg = await Order.aggregate([
      { $match: query },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalSoldProducts: { $sum: "$items.quantity" },
        },
      },
    ]);
    const totalSoldProducts = soldAgg[0]?.totalSoldProducts || 0;

    console.log("Summary Data:", {
      totalOrders,
      totalRevenue,
      totalSoldProducts,
    });

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalVariants,
      totalSoldProducts,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};
