// //api/stats/dashboard
// import connectDB from "@/config/db";
// import Order from "@/models/Order";
// import User from "@/models/User";
// import Product from "@/models/Product";
// import { NextResponse } from "next/server";

// export async function GET() {
//   await connectDB();

//   const orders = await Order.find({
//     status: { $in: ["paid", "shipped"] }, // Thêm "delivered" nếu có
//   })
//     .populate("items.product")
//     .populate("items.variantId");

//   let totalRevenue = 0;
//   let totalItemsSold = 0;

//   orders.forEach((order) => {
//     order.items.forEach((item) => {
//       const price = item.variantId?.price || item.price || 0;
//       totalRevenue += price * item.quantity;
//       totalItemsSold += item.quantity;
//     });
//   });

//   const totalOrders = orders.length;
//   const totalUsers = await User.countDocuments({});
//   const totalProducts = await Product.countDocuments({});

//   console.log("Dashboard Data:", {
//     totalOrders,
//     totalRevenue,
//     totalItemsSold,
//   });

//   return NextResponse.json({
//     totalRevenue,
//     totalOrders,
//     totalItemsSold,
//     totalUsers,
//     totalProducts,
//   });
// }
import connectDB from "@/config/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const query = {
    status: { $in: ["paid", "shipped"] }, // Thêm "delivered" nếu có
  };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate + "T23:59:59.999Z"),
    };
  }

  const orders = await Order.find(query)
    .populate("items.product")
    .populate("items.variantId");

  let totalRevenue = 0;
  let totalItemsSold = 0;

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const price = item.variantId?.price || item.price || 0;
      totalRevenue += price * item.quantity;
      totalItemsSold += item.quantity;
    });
  });

  const totalOrders = orders.length;
  const totalUsers = await User.countDocuments({});
  const totalProducts = await Product.countDocuments({});

  console.log("Dashboard Data:", {
    totalOrders,
    totalRevenue,
    totalItemsSold,
  });

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    totalItemsSold,
    totalUsers,
    totalProducts,
  });
}
