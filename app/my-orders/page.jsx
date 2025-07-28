"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

const MyOrders = () => {
  const { currency, getToken, user, formatCurrency, router } = useAppContext();
  const { isLoaded, isSignedIn } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      if (!token || !isSignedIn) {
        toast.error("Vui lòng đăng nhập để xem đơn hàng của bạn");
        router.push("/sign-in");
        return;
      }
      const { data } = await axios.get("/api/order/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOrders(data.orders.reverse());
      } else {
        if (data.message === "Người dùng không được tìm thấy") {
          toast.error(
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
          );
          router.push("/sign-in");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        router.push("/sign-in");
      } else {
        toast.error("Lỗi khi tải đơn hàng: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingStatus = async () => {
    // Chỉ update tracking status nếu có orders
    if (orders.length === 0) {
      console.log("No orders to update tracking status");
      return;
    }
    
    try {
      const updatedOrders = await Promise.all(
        orders.map(async (order) => {
          const tracking = order.trackingCode;
          if (tracking && !tracking.startsWith("TEMP-")) {
            try {
              const { data: ghnData } = await axios.get(
                `/api/track-order?order_code=${tracking}`
              );
              return {
                ...order,
                ghnStatus: ghnData.data?.status || null,
                ghnStatusText: ghnData.data?.status_name || order.status,
              };
            } catch (error) {
              console.warn(`Track Order Error for ${tracking}:`, error.message);
              return { ...order, ghnStatus: null, ghnStatusText: order.status };
            }
          }
          return { ...order, ghnStatus: null, ghnStatusText: order.status };
        })
      );
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error updating tracking status:", error);
    }
  };

  const getVariantName = (variant) => {
    if (
      !variant ||
      !variant.attributeRefs ||
      variant.attributeRefs.length === 0
    ) {
      console.log("No attributeRefs found for variant:", variant);
      return "";
    }
    if (typeof variant === "string" || !variant._id) {
      console.log("Invalid variant format:", variant);
      return "";
    }
    const variantDetails = variant.attributeRefs
      .map((ref) => ref.value)
      .join(", ");
    return ` (${variantDetails})`;
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

  const getStatusText = (status, ghnStatusText) => {
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
      case "canceled":
        return "Đã hủy";
      case "ghn_failed":
        return "Lỗi tạo đơn GHN";
      case "Chờ lấy hàng":
        return "Chờ lấy hàng";
      case "Đang giao":
        return ghnStatusText || "Đang giao";
      case "Đã giao":
        return "Giao thành công";
      case "Đã hủy":
        return "Đã hủy";
      default:
        return ghnStatusText || "Chưa xác định";
    }
  };

  useEffect(() => {
    if (!isLoaded) {
      console.log("Đang đợi Clerk tải dữ liệu người dùng...");
      return;
    }
    if (user && isSignedIn) {
      fetchOrders(); // Lấy danh sách đơn hàng một lần khi load
    } else {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn]); // Loại bỏ user khỏi dependency để tránh re-run

  // Separate useEffect cho tracking interval
  useEffect(() => {
    if (orders.length > 0) {
      const intervalId = setInterval(fetchTrackingStatus, 60000); // Cập nhật trạng thái mỗi 1 phút
      return () => clearInterval(intervalId);
    }
  }, [orders.length]); // Chỉ dependency vào length thay vì toàn bộ orders array

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-4 sm:px-6 md:px-16 lg:px-32 py-6 min-h-screen bg-gray-50">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đơn Đặt Hàng Của Tôi
            </h2>
            <p className="text-gray-600">
              Theo dõi tình trạng các đơn hàng của bạn
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loading />
            </div>
          ) : (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có đơn hàng nào
                  </h3>
                  <p className="text-gray-500">
                    Hãy khám phá và mua sắm những sản phẩm yêu thích của bạn
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sản phẩm - hiển thị dọc từng sản phẩm */}
                        <div className="flex-1 min-w-0">
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
                                      alt={
                                        item.product?.name || "Product Image"
                                      }
                                      width={48}
                                      height={48}
                                    />
                                  ) : (
                                    <Image
                                      className="w-full h-full object-cover rounded-lg"
                                      src={assets.box_icon}
                                      alt="order icon"
                                      width={48}
                                      height={48}
                                    />
                                  )}
                                </div>

                                {/* Thông tin sản phẩm */}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-sm line-clamp-2">
                                    {item.product?.name ||
                                      "Sản phẩm không xác định"}
                                    {item.variantId?.attributeRefs &&
                                      item.variantId.attributeRefs.length >
                                        0 && (
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
                                        0) * item.quantity
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatCurrency(
                                      item.variantId?.offerPrice ||
                                        item.variantId?.price ||
                                        item.product?.offerPrice ||
                                        item.product?.price ||
                                        0
                                    )}
                                    /cái
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Thông tin giao hàng */}
                        <div className="flex-1 min-w-0 lg:max-w-xs">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Thông tin giao hàng
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="font-medium text-gray-900">
                              Tên Khách hàng:{" "}
                              {order.address?.fullName || "Tên không xác định"}
                            </div>
                            <div className="font-medium text-gray-900">
                              Địa chỉ: {order.address?.area || "N/A"}
                            </div>
                            <div className="font-medium text-gray-900">
                              {order.address?.city && order.address?.state
                                ? `${order.address.city}, ${order.address.state}, `
                                : "N/A"}
                              {order.address?.ward &&
                              order.address?.ward !== "Khác"
                                ? `${order.address.ward}, `
                                : ""}
                            </div>
                            <div className="font-medium">
                              SĐT: {order.address?.phoneNumber || "N/A"}
                            </div>
                          </div>
                        </div>

                        {/* Tổng tiền */}
                        <div className="flex-shrink-0 text-center lg:text-right">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Tổng tiền
                          </h4>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(order.amount)}
                          </div>
                        </div>
                      </div>

                      {/* Thông tin đơn hàng */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">
                              Phương thức thanh toán:
                            </span>
                            <div className="font-medium text-gray-900 mt-1">
                              {getPaymentMethodText(order.paymentMethod)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              Ngày đặt hàng:
                            </span>
                            <div className="font-medium text-gray-900 mt-1">
                              {new Date(order.date).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Mã đơn hàng:</span>
                            <div className="font-medium text-gray-900 mt-1 font-mono text-xs">
                              #{order._id.slice(-8).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Trạng thái:</span>
                            <div className="mt-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  order.status === "delivered" ||
                                  order.status === "Đã giao"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "canceled" ||
                                      order.status === "Đã hủy"
                                    ? "bg-red-100 text-red-800"
                                    : order.status === "shipped" ||
                                      order.status === "Đang giao"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {getStatusText(
                                  order.status,
                                  order.ghnStatusText
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
