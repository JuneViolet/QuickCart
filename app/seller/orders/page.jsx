"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const Orders = () => {
  const { currency, getToken, user, formatCurrency } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchSellerOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/order/seller-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        console.log("Seller Orders:", data.orders);
        const sortedOrders = [...data.orders].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders); // Khởi tạo filtered orders
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "paid":
        return "Đã thanh toán";
      case "confirmed":
        return "Đã xác nhận";
      case "shipped":
        return "Đang giao";
      case "delivered":
        return "Giao thành công";
      case "delivered_by_ghn":
        return "Giao thành công (GHN xác nhận)";
      case "canceled":
        return "Đã hủy";
      case "ghn_failed":
        return "Lỗi tạo đơn GHN";
      case "Chờ lấy hàng":
        return "Chờ lấy hàng";
      case "Đang giao":
        return "Đang giao";
      case "Đã giao":
        return "Giao thành công";
      case "Đã hủy":
        return "Đã hủy";
      default:
        return "Chưa xác định";
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method?.toLowerCase()) {
      case "vnpay":
        return "Thanh toán qua VNPAY";
      case "cod":
        return "Thanh toán khi nhận hàng (COD)";
      default:
        return "Phương thức không xác định";
    }
  };

  const handleAction = async (orderId, action) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/seller-action",
        { orderId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchSellerOrders(); // Làm mới danh sách
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi thực hiện hành động: " + error.message);
    }
  };

  // Tìm kiếm và lọc đơn hàng
  const handleSearch = () => {
    let filtered = [...orders];

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        const orderId = order._id.slice(-8).toUpperCase();
        const customerName = order.address?.fullName?.toLowerCase() || "";
        const customerPhone = order.address?.phoneNumber || "";
        const trackingCode = order.trackingCode || "";

        return (
          orderId.includes(query.toUpperCase()) ||
          customerName.includes(query) ||
          customerPhone.includes(query) ||
          trackingCode.toLowerCase().includes(query)
        );
      });
    }

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  // Reset bộ lọc
  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setFilteredOrders(orders);
  };

  // Tự động tìm kiếm khi thay đổi
  useEffect(() => {
    handleSearch();
  }, [searchQuery, statusFilter, orders]);

  useEffect(() => {
    if (user) {
      fetchSellerOrders();
    }
  }, [user]);

  return (
    <div className="h-screen overflow-scroll flex flex-col justify-between text-sm min-w-0">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8">
          {/* Header và tìm kiếm */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quản Lý Đơn Hàng
            </h2>

            {/* Thanh tìm kiếm */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn hàng, tên khách hàng, số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipped">Đang giao</option>
                  <option value="delivered">Giao thành công</option>
                  <option value="canceled">Đã hủy</option>
                </select>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Thống kê */}
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-gray-600">
                Tổng:{" "}
                <span className="font-semibold text-gray-900">
                  {orders.length}
                </span>{" "}
                đơn hàng
              </span>
              <span className="text-gray-600">
                Hiển thị:{" "}
                <span className="font-semibold text-blue-600">
                  {filteredOrders.length}
                </span>{" "}
                đơn hàng
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            {/* Thêm scroll ngang cho mobile */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || statusFilter !== "all"
                    ? "Không tìm thấy đơn hàng"
                    : "Chưa có đơn hàng nào"}
                </h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== "all"
                    ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                    : "Đơn hàng mới sẽ xuất hiện ở đây"}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col xl:flex-row gap-4 justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm mb-4 min-w-max"
                >
                  {/* Sản phẩm - hiển thị dọc từng sản phẩm */}
                  <div className="flex-1 min-w-0 lg:min-w-80 xl:max-w-96">
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-center p-2 bg-gray-50 rounded-lg"
                        >
                          {/* Hình ảnh sản phẩm */}
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {(item?.variantId?.images &&
                              item?.variantId?.images.length > 0) ||
                            (item?.product?.images &&
                              item?.product?.images.length > 0) ? (
                              <Image
                                className="w-full h-full object-cover rounded-lg"
                                src={
                                  (item?.variantId?.images &&
                                    item?.variantId?.images[0]) ||
                                  item?.product?.images[0]
                                }
                                alt={item.product?.name || "Product Image"}
                                width={48}
                                height={48}
                              />
                            ) : (
                              <Image
                                className="w-full h-full object-cover rounded-lg"
                                src={assets.placeholder_image}
                                alt="Placeholder"
                                width={48}
                                height={48}
                              />
                            )}
                          </div>

                          {/* Thông tin sản phẩm */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm line-clamp-2">
                              {item.product?.name || "Unknown Product"}
                              {item.variantId?.attributeRefs &&
                                item.variantId.attributeRefs.length > 0 && (
                                  <span className="text-gray-600 font-normal">
                                    {" "}
                                    (
                                    {item.variantId.attributeRefs
                                      .map((ref) => ref.value)
                                      .join("/")}
                                    )
                                  </span>
                                )}
                              <span className="text-gray-600 font-normal">
                                {" "}
                                x {item.quantity}
                              </span>
                            </div>
                          </div>

                          {/* Giá tiền sản phẩm */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-semibold text-green-600">
                              {formatCurrency(
                                (item.variantId?.offerPrice ||
                                  item.variantId?.price ||
                                  item.product?.offerPrice ||
                                  item.product?.price ||
                                  0) * item.quantity,
                                currency
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatCurrency(
                                item.variantId?.offerPrice ||
                                  item.variantId?.price ||
                                  item.product?.offerPrice ||
                                  item.product?.price ||
                                  0,
                                currency
                              )}
                              /cái
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thông tin giao hàng - mở rộng */}
                  <div className="flex-1 min-w-0 lg:min-w-64">
                    <div className="text-gray-700 space-y-1">
                      <div className="font-medium text-gray-900">
                        {order.address?.fullName || "Unknown Name"}
                      </div>
                      <div className="text-sm">
                        {order.address?.area || "N/A"}
                      </div>
                      <div className="text-sm">
                        {order.address?.city && order.address?.state
                          ? `${order.address.city}, ${order.address.state}`
                          : "N/A"}
                      </div>
                      <div className="text-sm">
                        {order.address?.phoneNumber || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Tổng tiền */}
                  <div className="flex-1 text-center lg:min-w-32">
                    <div className="font-semibold text-lg text-green-600">
                      {formatCurrency(order.amount, currency)}
                    </div>
                  </div>

                  {/* Trạng thái và hành động - mở rộng */}
                  <div className="flex-1 lg:min-w-80">
                    <div className="flex flex-col items-end gap-3">
                      {/* Thông tin đơn hàng */}
                      <div className="text-right space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Mã đơn hàng
                        </div>
                        <div className="font-mono text-sm font-semibold text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Phương thức:{" "}
                          {getPaymentMethodText(order.paymentMethod)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Ngày:{" "}
                          {new Date(order.date).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Trạng thái: </span>
                          <span
                            className={`font-semibold ${
                              order.status === "delivered" ||
                              order.status === "Đã giao"
                                ? "text-green-600"
                                : order.status === "canceled" ||
                                  order.status === "Đã hủy"
                                ? "text-red-600"
                                : order.status === "shipped" ||
                                  order.status === "Đang giao"
                                ? "text-blue-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Mã theo dõi: {order.trackingCode || "N/A"}
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div className="flex flex-wrap gap-2 justify-end">
                        {/* Nút xác nhận - chỉ hiển thị cho đơn chờ xác nhận */}
                        {(order.status === "pending" ||
                          order.status === "Chờ lấy hàng" ||
                          order.status === "ghn_success" ||
                          (order.status === "paid" &&
                            order.trackingCode?.startsWith("TEMP-"))) && (
                          <button
                            onClick={() => handleAction(order._id, "confirm")}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                          >
                            ✅ Xác nhận
                          </button>
                        )}

                        {/* Nút giao thành công - chỉ hiển thị cho đơn đang giao */}
                        {(order.status === "shipped" ||
                          order.status === "Đang giao" ||
                          order.status === "confirmed") && (
                          <button
                            onClick={() => handleAction(order._id, "delivered")}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                          >
                            🚚 Giao thành công
                          </button>
                        )}

                        {/* Nút hủy - chỉ hiển thị cho đơn chưa giao */}
                        {(order.status === "pending" ||
                          order.status === "Chờ lấy hàng" ||
                          order.status === "ghn_success" ||
                          order.status === "confirmed" ||
                          (order.status === "paid" &&
                            order.trackingCode?.startsWith("TEMP-"))) && (
                          <button
                            onClick={() => handleAction(order._id, "cancel")}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                          >
                            ❌ Hủy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* <Footer /> */}
    </div>
  );
};

export default Orders;
