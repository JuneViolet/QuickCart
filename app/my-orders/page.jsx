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
        const updatedOrders = await Promise.all(
          data.orders.map(async (order) => {
            const tracking = order.trackingCode;
            if (tracking && !tracking.startsWith("TEMP-")) {
              try {
                const { data: ghnData } = await axios.get(
                  `/api/track-order?order_code=${tracking}`
                );
                // Chỉ cập nhật nếu trạng thái khác
                if (ghnData.data?.status !== order.status) {
                  return {
                    ...order,
                    ghnStatus: ghnData.data?.status || null,
                    ghnStatusText: ghnData.data?.status_name || order.status,
                  };
                }
              } catch (error) {
                console.warn(
                  `Track Order Error for ${tracking}:`,
                  error.message
                );
              }
            }
            return { ...order, ghnStatus: null, ghnStatusText: order.status };
          })
        );
        setOrders(updatedOrders.reverse());
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
      fetchOrders();
      const intervalId = setInterval(fetchOrders, 30000); // Tăng lên 30 giây
      return () => clearInterval(intervalId);
    } else {
      router.push("/sign-in");
    }
  }, [user, isLoaded, isSignedIn]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <div className="space-y-5">
          <h2 className="text-lg font-medium mt-6">Đơn Đặt Hàng</h2>
          {loading ? (
            <Loading />
          ) : (
            <div className="max-w-5xl border-t border-gray-300 text-sm">
              {orders.length === 0 ? (
                <p className="text-gray-500">Không Tìm Thấy Đơn Đặt Hàng</p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300"
                  >
                    <div className="flex-1 flex gap-5 max-w-80">
                      <Image
                        className="max-w-16 max-h-16 object-cover"
                        src={assets.box_icon}
                        alt="box_icon"
                      />
                      <p className="flex flex-col gap-3">
                        <span className="font-medium text-base">
                          {order.items
                            .map((item) => {
                              const product = item.product;
                              if (!product?.name || !item.variantId) {
                                console.log("Missing data:", { product, item });
                                return `${
                                  product?.name || "Sản phẩm không xác định"
                                } x ${item.quantity}`;
                              }
                              const productName =
                                product?.name || "Sản phẩm không xác định";
                              const variantName = getVariantName(
                                item.variantId
                              );
                              return `${productName}${variantName} x ${item.quantity}`;
                            })
                            .join(", ")}
                        </span>
                        <span>Sản Phẩm: {order.items.length}</span>
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">
                          {order.address?.fullName || "Tên không xác định"}
                        </span>
                        <br />
                        <span>{order.address?.area || "N/A"}</span>
                        <br />
                        <span>
                          {order.address?.ward && order.address?.ward !== "Khác"
                            ? `${order.address.ward}, `
                            : ""}
                          {order.address?.city && order.address?.state
                            ? `${order.address.city}, ${order.address.state}`
                            : "N/A"}
                        </span>
                        <br />
                        <span>{order.address?.phoneNumber || "N/A"}</span>
                      </p>
                    </div>
                    <p className="font-medium my-auto">
                      {formatCurrency(order.amount)}
                    </p>
                    <div>
                      <p className="flex flex-col">
                        <span>
                          Phương thức:{" "}
                          {getPaymentMethodText(order.paymentMethod)}
                        </span>
                        <span>
                          Ngày: {new Date(order.date).toLocaleDateString()}
                        </span>
                        <span>
                          Trạng thái:{" "}
                          {getStatusText(order.status, order.ghnStatusText)}
                        </span>
                      </p>
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
