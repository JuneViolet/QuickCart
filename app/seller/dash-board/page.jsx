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
  ComposedChart,
  Line,
  LineChart,
} from "recharts";

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
  "#F472B6",
  "#14B8A6",
  "#F97316",
];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // Cho dropdown
  const [orderDistribution, setOrderDistribution] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    isFiltering: false,
  });

  // Function để chuyển đổi trạng thái sang tiếng Việt
  const getStatusText = (status) => {
    const statusMap = {
      pending: "Chờ xác nhận",
      paid: "Đã thanh toán",
      confirmed: "Đã xác nhận",
      shipped: "Đang giao",
      delivered: "Giao thành công",
      canceled: "Đã hủy",
      ghn_failed: "Lỗi GHN",
      "Chờ lấy hàng": "Chờ lấy hàng",
      "Đang giao": "Đang giao",
      "Đã giao": "Giao thành công",
      "Đã hủy": "Đã hủy",
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDateFilter((prev) => ({ ...prev, isFiltering: true }));

        const [
          summaryRes,
          categoryRes,
          distributionRes,
          topProductsRes,
          allCategoriesRes,
        ] = await Promise.all([
          axios.get("/api/stats/summary", {
            params: {
              startDate: dateFilter.startDate,
              endDate: dateFilter.endDate,
            },
          }),
          axios.get("/api/stats/category", {
            params: {
              startDate: dateFilter.startDate,
              endDate: dateFilter.endDate,
              category: selectedCategory,
            },
          }),
          axios.get("/api/stats/order-distribution", {
            params: {
              startDate: dateFilter.startDate,
              endDate: dateFilter.endDate,
            },
          }),
          axios.get("/api/stats/top-products", {
            params: {
              startDate: dateFilter.startDate,
              endDate: dateFilter.endDate,
              category: selectedCategory,
              limit: 10,
            },
          }),
          // Lấy tất cả categories cho dropdown (không filter)
          axios.get("/api/stats/category", {
            params: {
              startDate: dateFilter.startDate,
              endDate: dateFilter.endDate,
            },
          }),
        ]);

        console.log("Summary:", summaryRes.data);
        console.log("Category Stats:", categoryRes.data);
        console.log("Order Distribution:", distributionRes.data);
        console.log("Top Products:", topProductsRes.data);
        console.log("All Categories:", allCategoriesRes.data);

        setSummary(summaryRes.data);
        setCategoryStats(categoryRes.data || []);
        setAllCategories(allCategoriesRes.data || []);
        setOrderDistribution(distributionRes.data || []);
        setTopProducts(topProductsRes.data || []);
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
      } finally {
        setDateFilter((prev) => ({ ...prev, isFiltering: false }));
      }
    };

    fetchData();
  }, [dateFilter.startDate, dateFilter.endDate, selectedCategory]);

  const calculatedTotalRevenue = categoryStats.reduce(
    (sum, item) => sum + (item.totalRevenue || 0),
    0
  );
  const calculatedTotalSold = categoryStats.reduce(
    (sum, item) => sum + (item.totalSold || 0),
    0
  );

  const handleDateChange = (field, value) => {
    setDateFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setQuickFilter = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    setDateFilter({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      isFiltering: false,
    });
  };

  // Hàm tạo và tải file CSV
  const exportRevenueReport = () => {
    const headers = ["Loại sản phẩm", "Số lượng bán", "Doanh thu (VND)"].join(
      ","
    );
    const rows = categoryStats.map((item) =>
      [
        item.category,
        item.totalSold,
        item.totalRevenue
          .toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
          })
          .replace(/₫/g, "")
          .trim(),
      ].join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `revenue_report_${dateFilter.startDate}_to_${dateFilter.endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Thống Kê
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Tổng quan về tình hình kinh doanh
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div
                  className={`w-2 h-2 rounded-full ${
                    dateFilter.isFiltering
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-green-400"
                  }`}
                ></div>
                <span>
                  {dateFilter.isFiltering
                    ? "Đang tải..."
                    : "Cập nhật thành công"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* //điều chỉnh bảng */}
      <div className="w-screen px-4 sm:px-6 py-8" style={{ maxWidth: "80vw" }}>
        {" "}
        {/* Thay đổi này */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Bộ lọc thời gian
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">
                    Từ ngày:
                  </label>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) =>
                      handleDateChange("startDate", e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">
                    Đến ngày:
                  </label>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) =>
                      handleDateChange("endDate", e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>

                <div className="flex items-center space-x-2 ml-auto">
                  <span className="text-sm font-medium text-gray-700">
                    Lọc nhanh:
                  </span>
                  <button
                    onClick={() => setQuickFilter(7)}
                    className="px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                  >
                    7 ngày
                  </button>
                  <button
                    onClick={() => setQuickFilter(30)}
                    className="px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                  >
                    30 ngày
                  </button>
                  <button
                    onClick={() => setQuickFilter(90)}
                    className="px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                  >
                    3 tháng
                  </button>
                  <button
                    onClick={() => setQuickFilter(365)}
                    className="px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                  >
                    1 năm
                  </button>

                  <div className="ml-4 flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">
                      Lọc danh mục:
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="">Tất cả danh mục</option>
                      {allCategories.map((cat) => (
                        <option key={cat.category} value={cat.category}>
                          {cat.category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">Khoảng thời gian hiện tại:</span>{" "}
                <span className="bg-white px-2 py-1 rounded border">
                  {new Date(dateFilter.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(dateFilter.endDate).toLocaleDateString("vi-VN")}
                </span>
                <span className="ml-2">
                  (
                  {Math.ceil(
                    (new Date(dateFilter.endDate) -
                      new Date(dateFilter.startDate)) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  ngày)
                </span>
                <button
                  onClick={async () => {
                    const response = await axios.get(
                      "/api/export/revenue-report",
                      {
                        params: {
                          startDate: dateFilter.startDate,
                          endDate: dateFilter.endDate,
                        },
                        responseType: "blob", // Quan trọng để nhận file binary
                      }
                    );
                    const url = window.URL.createObjectURL(
                      new Blob([response.data])
                    );
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute(
                      "download",
                      `revenue_report_${dateFilter.startDate}_to_${dateFilter.endDate}.xlsx`
                    );
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  }}
                  className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  disabled={dateFilter.isFiltering}
                >
                  Xuất báo cáo
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard
              title="Tổng đơn hàng"
              value={summary?.totalOrders}
              bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
              textColor="text-white"
              isLoading={dateFilter.isFiltering}
            />
            <SummaryCard
              title="Tổng doanh thu"
              value={summary?.totalRevenue?.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
              note={`Từ danh mục: ${calculatedTotalRevenue.toLocaleString(
                "vi-VN",
                {
                  style: "currency",
                  currency: "VND",
                }
              )}`}
              bgColor="bg-gradient-to-r from-green-500 to-green-600"
              textColor="text-white"
              isLoading={dateFilter.isFiltering}
            />
            <SummaryCard
              title="Sản phẩm đã bán"
              value={summary?.totalSoldProducts}
              note={`Từ danh mục: ${calculatedTotalSold}`}
              bgColor="bg-gradient-to-r from-purple-500 to-purple-600"
              textColor="text-white"
              isLoading={dateFilter.isFiltering}
            />
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Doanh thu theo loại sản phẩm
                    </h2>
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedCategory
                      ? `Danh mục: ${selectedCategory}`
                      : "Tất cả danh mục"}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Phân tích doanh thu từng danh mục
                  {selectedCategory ? ` (${selectedCategory})` : ""} (
                  {new Date(dateFilter.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(dateFilter.endDate).toLocaleDateString("vi-VN")})
                </p>
              </div>
              <div className="p-6 relative">
                {dateFilter.isFiltering && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">
                        Đang cập nhật dữ liệu...
                      </span>
                    </div>
                  </div>
                )}
                <div style={{ width: "100%", height: 500 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={categoryStats}
                      margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorSold"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3B82F6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3B82F6"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="category"
                        angle={0}
                        textAnchor="middle"
                        interval={0}
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                        height={80}
                      />
                      <YAxis
                        yAxisId="revenue"
                        orientation="left"
                        tickFormatter={(value) =>
                          Number(value).toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            maximumFractionDigits: 0,
                          })
                        }
                        tick={{ fontSize: 11 }}
                        stroke="#10B981"
                      />
                      <YAxis
                        yAxisId="quantity"
                        orientation="right"
                        tickFormatter={(value) => `${value} sp`}
                        tick={{ fontSize: 11 }}
                        stroke="#3B82F6"
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "totalRevenue") {
                            return [
                              Number(value).toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                                maximumFractionDigits: 0,
                              }),
                              "Doanh thu",
                            ];
                          } else if (name === "totalSold") {
                            return [`${value} sản phẩm`, "Đã bán"];
                          }
                          return [value, name];
                        }}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar
                        yAxisId="revenue"
                        dataKey="totalRevenue"
                        fill="url(#colorRevenue)"
                        barSize={30}
                        radius={[4, 4, 0, 0]}
                        name="Doanh thu"
                      />
                      <Bar
                        yAxisId="quantity"
                        dataKey="totalSold"
                        fill="url(#colorSold)"
                        barSize={30}
                        radius={[4, 4, 0, 0]}
                        name="Sản phẩm đã bán"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Phân bố đơn hàng theo trạng thái
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Tình trạng xử lý đơn hàng (
                  {new Date(dateFilter.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(dateFilter.endDate).toLocaleDateString("vi-VN")})
                </p>
              </div>
              <div className="p-6 relative">
                {dateFilter.isFiltering && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">
                        Đang cập nhật dữ liệu...
                      </span>
                    </div>
                  </div>
                )}
                <div style={{ width: "100%", height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          Array.isArray(orderDistribution)
                            ? orderDistribution
                            : []
                        }
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={130}
                        innerRadius={60}
                        label={({ status, percent }) =>
                          `${getStatusText(status)} (${(percent * 100).toFixed(
                            0
                          )}%)`
                        }
                        labelLine={false}
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {Array.isArray(orderDistribution)
                          ? orderDistribution.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))
                          : null}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value, name) => [
                          value,
                          getStatusText(name),
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ paddingTop: "20px" }}
                        formatter={(value) => getStatusText(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Sản Phẩm Bán Chạy */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Top Sản Phẩm Bán Chạy
                    </h2>
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedCategory
                      ? `Danh mục: ${selectedCategory}`
                      : "Tất cả danh mục"}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Những sản phẩm có doanh số cao nhất (
                  {new Date(dateFilter.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(dateFilter.endDate).toLocaleDateString("vi-VN")})
                </p>
              </div>
              <div className="p-6 relative">
                {dateFilter.isFiltering && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">
                        Đang cập nhật dữ liệu...
                      </span>
                    </div>
                  </div>
                )}

                {topProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Không có dữ liệu sản phẩm trong khoảng thời gian này</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Thứ hạng
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Sản phẩm
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Danh mục
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">
                            Đã bán
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">
                            Doanh thu
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {topProducts.map((product, index) => (
                          <tr
                            key={product.productId}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <span
                                  className={`
                                  inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                                  ${
                                    index === 0
                                      ? "bg-yellow-100 text-yellow-800"
                                      : index === 1
                                      ? "bg-gray-100 text-gray-800"
                                      : index === 2
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-blue-100 text-blue-800"
                                  }
                                `}
                                >
                                  {index + 1}
                                </span>
                                {index < 3 && (
                                  <span className="ml-2 text-lg"></span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                {product.image && (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900 text-sm leading-tight">
                                    {product.name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {product.category}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="font-semibold text-gray-900">
                                {product.totalSold.toLocaleString()} sp
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="font-semibold text-green-600">
                                {product.totalRevenue.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  note,
  icon,
  bgColor,
  textColor,
  isLoading,
}) {
  return (
    <div
      className={`${bgColor} rounded-2xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-200`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{icon}</span>
              <h3 className={`text-lg font-medium ${textColor}`}>{title}</h3>
            </div>
            <div className={`text-3xl font-bold ${textColor} mb-2`}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-lg">Đang tải...</span>
                </div>
              ) : (
                value ?? (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg">Đang tải...</span>
                  </div>
                )
              )}
            </div>
            {note && !isLoading && (
              <p
                className={`text-sm ${textColor} opacity-90 bg-black bg-opacity-10 rounded-lg px-3 py-1 mt-2`}
              >
                {note}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="h-1 bg-white bg-opacity-20"></div>
    </div>
  );
}
