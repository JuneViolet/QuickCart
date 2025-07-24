// pages/api/stats/revenue-by-time.js hoặc app/api/stats/revenue-by-time/route.js

import { NextResponse } from "next/server";

// Giả sử bạn có database connection
import connectDB from "@/config/db";
import Order from "@/models/Order";

// Mock data function cho demo - thay thế bằng database query thực tế
function generateRevenueData(startDate, endDate, period) {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Tính số ngày giữa start và end
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (period === "day") {
    // Tạo data theo ngày
    for (let i = 0; i <= diffDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);

      // Mock revenue với pattern realistic
      const baseRevenue = 3000000;
      const randomFactor =
        Math.sin(i * 0.5) * 2000000 + Math.random() * 1000000;
      const weekendBonus = [0, 6].includes(currentDate.getDay()) ? 1000000 : 0;

      data.push({
        date: currentDate.toISOString().split("T")[0],
        revenue: Math.max(
          0,
          Math.floor(baseRevenue + randomFactor + weekendBonus)
        ),
        orders: Math.floor(Math.random() * 30) + 10,
        averageOrderValue: 0, // Sẽ tính sau
      });
    }
  } else if (period === "week") {
    // Tạo data theo tuần
    const weeks = Math.ceil(diffDays / 7);
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + i * 7);

      data.push({
        date: weekStart.toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 15000000) + 10000000,
        orders: Math.floor(Math.random() * 150) + 50,
        averageOrderValue: 0,
      });
    }
  } else if (period === "month") {
    // Tạo data theo tháng
    const months = Math.ceil(diffDays / 30);
    for (let i = 0; i < months; i++) {
      const monthStart = new Date(start);
      monthStart.setMonth(start.getMonth() + i);

      data.push({
        date: monthStart.toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 50000000) + 30000000,
        orders: Math.floor(Math.random() * 500) + 200,
        averageOrderValue: 0,
      });
    }
  }

  // Tính average order value
  data.forEach((item) => {
    item.averageOrderValue =
      item.orders > 0 ? Math.floor(item.revenue / item.orders) : 0;
  });

  return data;
}

// Database query function - thay thế mock data bằng code này
async function getRevenueDataFromDB(startDate, endDate, period) {
  try {
    // await connectDB();

    let groupByFormat;
    let sortField;

    switch (period) {
      case "day":
        groupByFormat = "%Y-%m-%d";
        sortField = "date";
        break;
      case "week":
        groupByFormat = "%Y-%u"; // Year-Week
        sortField = "year_week";
        break;
      case "month":
        groupByFormat = "%Y-%m";
        sortField = "year_month";
        break;
      default:
        groupByFormat = "%Y-%m-%d";
        sortField = "date";
    }

    // MongoDB aggregation example

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
          status: { $in: ["paid", "completed", "delivered"] }, // Chỉ tính đơn hàng thành công
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupByFormat,
              date: "$createdAt",
            },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $count: {} },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: { $round: ["$revenue", 0] },
          orders: "$orders",
          averageOrderValue: { $round: ["$averageOrderValue", 0] },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    // Tạm thời return mock data
    return generateRevenueData(startDate, endDate, period);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Next.js 13+ App Router (app/api/stats/revenue-by-time/route.js)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Lấy parameters từ query string
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const period = searchParams.get("period") || "day";

    // Validation
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate và endDate là bắt buộc" },
        { status: 400 }
      );
    }

    // Validate date format
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        { error: "Định dạng ngày không hợp lệ (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    if (startDateObj > endDateObj) {
      return NextResponse.json(
        { error: "startDate phải nhỏ hơn endDate" },
        { status: 400 }
      );
    }

    // Validate period
    if (!["day", "week", "month"].includes(period)) {
      return NextResponse.json(
        { error: "period phải là day, week, hoặc month" },
        { status: 400 }
      );
    }

    // Lấy dữ liệu từ database
    const data = await getRevenueDataFromDB(startDate, endDate, period);

    // Thêm metadata
    const response = {
      data,
      metadata: {
        startDate,
        endDate,
        period,
        totalRecords: data.length,
        totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
        totalOrders: data.reduce((sum, item) => sum + item.orders, 0),
        generatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Lỗi server nội bộ" }, { status: 500 });
  }
}

// Next.js 12 Pages Router (pages/api/stats/revenue-by-time.js)
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method không được hỗ trợ" });
  }

  try {
    const { startDate, endDate, period = "day" } = req.query;

    // Validation (tương tự như trên)
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate và endDate là bắt buộc" });
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res
        .status(400)
        .json({ error: "Định dạng ngày không hợp lệ (YYYY-MM-DD)" });
    }

    if (startDateObj > endDateObj) {
      return res.status(400).json({ error: "startDate phải nhỏ hơn endDate" });
    }

    if (!["day", "week", "month"].includes(period)) {
      return res
        .status(400)
        .json({ error: "period phải là day, week, hoặc month" });
    }

    // Lấy dữ liệu
    const data = await getRevenueDataFromDB(startDate, endDate, period);

    const response = {
      data,
      metadata: {
        startDate,
        endDate,
        period,
        totalRecords: data.length,
        totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
        totalOrders: data.reduce((sum, item) => sum + item.orders, 0),
        generatedAt: new Date().toISOString(),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
}
