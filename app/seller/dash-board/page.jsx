"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
  "#F472B6",
];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [orderDistribution, setOrderDistribution] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, categoryRes, distributionRes] = await Promise.all([
          axios.get("/api/stats/summary"),
          axios.get("/api/stats/category"),
          axios.get("/api/stats/order-distribution"),
        ]);

        setSummary(summaryRes.data);
        setCategoryStats(categoryRes.data || []);
        setOrderDistribution(distributionRes.data || []);
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-10 bg-white min-h-screen w-full">
      <h1 className="text-3xl font-bold text-center">Thống kê bán hàng</h1>

      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Tổng đơn hàng" value={summary?.totalOrders} />
        <SummaryCard
          title="Tổng doanh thu"
          value={summary?.totalRevenue?.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        />
        <SummaryCard
          title="Tổng sản phẩm đã bán"
          value={summary?.totalSoldProducts}
        />
      </div>

      {/* Bar Chart - Doanh thu theo loại */}
      <div className="bg-gray-100 rounded-lg p-4 shadow-md">
        <h2 className="text-xl font-semibold text-center mb-4">
          Doanh thu theo loại sản phẩm
        </h2>
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryStats}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                angle={0}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tickFormatter={(value) =>
                  Number(value).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  })
                }
              />
              <Tooltip
                formatter={(value) =>
                  Number(value).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  })
                }
              />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#10B981" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart - Phân bố đơn hàng */}
      <div className="bg-gray-100 rounded-lg p-4 shadow-md">
        <h2 className="text-xl font-semibold text-center mb-4">
          Phân bố đơn hàng theo trạng thái
        </h2>
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={orderDistribution}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ status, percent }) =>
                  `${status} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {orderDistribution.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h3 className="text-lg font-medium mb-2 text-gray-700">{title}</h3>
      <p className="text-2xl font-bold text-green-600">{value ?? "..."}</p>
    </div>
  );
}
