import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Variant from "@/models/Variants";

export const GET = async () => {
  try {
    await connectDB();

    const totalOrders = await Order.countDocuments();

    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled", "pending"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const totalProducts = await Product.countDocuments();
    const totalVariants = await Variant.countDocuments();

    // 🟡 Tính tổng số sản phẩm đã bán
    const soldAgg = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled", "pending"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalSoldProducts: { $sum: "$items.quantity" },
        },
      },
    ]);
    const totalSoldProducts = soldAgg[0]?.totalSoldProducts || 0;

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalVariants,
      totalSoldProducts, // 👈 Trả về số lượng đã bán
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};
