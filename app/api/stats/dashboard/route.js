// /api/stats/dashboard/route.js
import connectDB from "@/config/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const orders = await Order.find({ status: "paid" });

  let totalRevenue = 0;
  let totalItemsSold = 0;

  orders.forEach((order) => {
    totalRevenue += order.amount;
    order.items.forEach((item) => {
      totalItemsSold += item.quantity;
    });
  });

  const totalOrders = orders.length;
  const totalUsers = await User.countDocuments({});
  const totalProducts = await Product.countDocuments({});

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    totalItemsSold,
    totalUsers,
    totalProducts,
  });
}
