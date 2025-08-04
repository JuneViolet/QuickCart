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
    const category = searchParams.get("category"); // Thêm category parameter

    const query = {
      status: { $in: ["paid", "shipped", "delivered"] }, // Thêm "delivered" cho đơn giao thành công
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    // Nếu có filter category, cần pipeline khác
    if (category) {
      // Lấy thống kê cho category cụ thể
      const categoryStats = await Order.aggregate([
        { $match: query },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        { $unwind: "$productInfo" },
        {
          $lookup: {
            from: "categories",
            localField: "productInfo.category",
            foreignField: "_id",
            as: "categoryInfo",
          },
        },
        { $unwind: "$categoryInfo" },
        { $match: { "categoryInfo.name": category } },
        {
          $group: {
            _id: "$_id",
            orderId: { $first: "$_id" },
            orderAmount: { $first: "$amount" },
            categoryItemsValue: {
              $sum: {
                $multiply: [
                  "$items.quantity",
                  {
                    $ifNull: [
                      "$items.variantId.offerPrice",
                      "$items.variantId.price",
                      "$productInfo.offerPrice",
                      "$productInfo.price",
                      0,
                    ],
                  },
                ],
              },
            },
            totalQuantity: { $sum: "$items.quantity" },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$categoryItemsValue" },
            totalSoldProducts: { $sum: "$totalQuantity" },
          },
        },
      ]);

      const stats = categoryStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalSoldProducts: 0,
      };

      console.log("Summary Data (with category filter):", {
        ...stats,
        category,
      });

      return NextResponse.json({
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        totalProducts: await Product.countDocuments(),
        totalVariants: await Variant.countDocuments(),
        totalSoldProducts: stats.totalSoldProducts,
      });
    } else {
      // Logic cũ cho trường hợp không có category filter
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
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};
