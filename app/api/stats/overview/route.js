// app/api/stats/overview/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import User from "@/models/User";

export const GET = async () => {
  try {
    await connectDB();

    const orders = await Order.find({
      status: { $in: ["pending", "ghn_success", "paid"] },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const totalProductsSold = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    const totalUsers = await User.countDocuments();

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProductsSold,
      totalUsers,
    });
  } catch (error) {
    console.error("Overview stats error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
