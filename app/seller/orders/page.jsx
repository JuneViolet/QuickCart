// //ỔN ĐỊNH
// "use client";
// import React, { useEffect, useState } from "react";
// import { assets } from "@/assets/assets";
// import Image from "next/image";
// import { useAppContext } from "@/context/AppContext";
// import Footer from "@/components/seller/Footer";
// import Loading from "@/components/Loading";
// import axios from "axios";
// import toast from "react-hot-toast";

// const Orders = () => {
//   const { currency, getToken, user, formatCurrency } = useAppContext();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchSellerOrders = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get("/api/order/seller-orders", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) {
//         console.log("Seller Orders:", data.orders);
//         // Sắp xếp danh sách theo date giảm dần (mới nhất lên đầu)
//         const sortedOrders = [...data.orders].sort(
//           (a, b) => new Date(b.date) - new Date(a.date)
//         );
//         setOrders(sortedOrders);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       fetchSellerOrders();
//     }
//   }, [user]);

//   return (
//     <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
//       {loading ? (
//         <Loading />
//       ) : (
//         <div className="md:p-10 p-4 space-y-5">
//           <h2 className="text-lg font-medium">Đơn Hàng Của Seller</h2>
//           <div className="max-w-4xl rounded-md">
//             {orders.length === 0 ? (
//               <p className="text-gray-500">
//                 Không tìm thấy đơn hàng nào cho Seller
//               </p>
//             ) : (
//               orders.map((order) => (
//                 <div
//                   key={order._id}
//                   className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300 hover:bg-gray-50 transition"
//                 >
//                   {/* Sản phẩm và biến thể */}
//                   <div className="flex-1 flex gap-5 max-w-80">
//                     {order.items[0]?.product?.images &&
//                     order.items[0]?.product?.images.length > 0 ? (
//                       <Image
//                         className="max-w-16 max-h-16 object-cover rounded"
//                         src={order.items[0].product.images[0]}
//                         alt={order.items[0].product.name || "Product Image"}
//                         width={64}
//                         height={64}
//                       />
//                     ) : (
//                       <Image
//                         className="max-w-16 max-h-16 object-cover rounded"
//                         src={assets.placeholder_image}
//                         alt="Placeholder"
//                         width={64}
//                         height={64}
//                       />
//                     )}
//                     <div className="flex flex-col gap-2">
//                       <span className="font-medium">
//                         {order.items
//                           .map((item) =>
//                             item.product?.name
//                               ? `${item.product.name} (${
//                                   item.variantId?.attributeRefs
//                                     ?.map((ref) => ref.value)
//                                     .join("/") || "Default"
//                                 }) x ${item.quantity}`
//                               : `Unknown Product x ${item.quantity}`
//                           )
//                           .join(", ")}
//                       </span>
//                       <span>Items: {order.items.length}</span>
//                     </div>
//                   </div>

//                   {/* Thông tin giao hàng */}
//                   <div className="flex-1">
//                     <p className="text-gray-700">
//                       <span className="font-medium">
//                         {order.address?.fullName || "Unknown Name"}
//                       </span>
//                       <br />
//                       <span>{order.address?.area || "N/A"}</span>
//                       <br />
//                       <span>
//                         {order.address?.city && order.address?.state
//                           ? `${order.address.city}, ${order.address.state}`
//                           : "N/A"}
//                       </span>
//                       <br />
//                       <span>{order.address?.phoneNumber || "N/A"}</span>
//                     </p>
//                   </div>

//                   {/* Tổng tiền */}
//                   <div className="flex-1 text-center">
//                     <p className="font-medium text-lg">
//                       {formatCurrency(order.amount, currency)}
//                     </p>
//                   </div>

//                   {/* Trạng thái và ngày */}
//                   <div className="flex-1 text-right">
//                     <p className="flex flex-col items-end">
//                       <span>Phương thức: COD</span>
//                       <span>
//                         Ngày: {new Date(order.date).toLocaleDateString("vi-VN")}
//                       </span>
//                       <span>Trạng thái: {order.status || "Pending"}</span>
//                       <span>Mã theo dõi: {order.trackingCode || "N/A"}</span>
//                     </p>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//       {/* <Footer /> */}
//     </div>
//   );
// };

// export default Orders;
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
  const [loading, setLoading] = useState(true);

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
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status, ghnTrackingCode) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "paid":
        return "Đã thanh toán";
      case "ghn_success":
        return ghnTrackingCode ? "Chờ lấy hàng" : "Đã tạo đơn GHN";
      case "shipped":
        return "Đang giao";
      case "delivered":
        return "Giao thành công";
      case "canceled":
        return "Đã hủy";
      case "ghn_failed":
        return "Lỗi tạo đơn GHN";
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

  useEffect(() => {
    if (user) {
      fetchSellerOrders();
    }
  }, [user]);

  return (
    <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
      {loading ? (
        <Loading />
      ) : (
        <div className="md:p-10 p-4 space-y-5">
          <h2 className="text-lg font-medium">Đơn Hàng Của Seller</h2>
          <div className="max-w-4xl rounded-md">
            {orders.length === 0 ? (
              <p className="text-gray-500">
                Không tìm thấy đơn hàng nào cho Seller
              </p>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300 hover:bg-gray-50 transition"
                >
                  {/* Sản phẩm và biến thể */}
                  <div className="flex-1 flex gap-5 max-w-80">
                    {order.items[0]?.product?.images &&
                    order.items[0]?.product?.images.length > 0 ? (
                      <Image
                        className="max-w-16 max-h-16 object-cover rounded"
                        src={order.items[0].product.images[0]}
                        alt={order.items[0].product.name || "Product Image"}
                        width={64}
                        height={64}
                      />
                    ) : (
                      <Image
                        className="max-w-16 max-h-16 object-cover rounded"
                        src={assets.placeholder_image}
                        alt="Placeholder"
                        width={64}
                        height={64}
                      />
                    )}
                    <div className="flex flex-col gap-2">
                      <span className="font-medium">
                        {order.items
                          .map((item) =>
                            item.product?.name
                              ? `${item.product.name} (${
                                  item.variantId?.attributeRefs
                                    ?.map((ref) => ref.value)
                                    .join("/") || "Default"
                                }) x ${item.quantity}`
                              : `Unknown Product x ${item.quantity}`
                          )
                          .join(", ")}
                      </span>
                      <span>Items: {order.items.length}</span>
                    </div>
                  </div>

                  {/* Thông tin giao hàng */}
                  <div className="flex-1">
                    <p className="text-gray-700">
                      <span className="font-medium">
                        {order.address?.fullName || "Unknown Name"}
                      </span>
                      <br />
                      <span>{order.address?.area || "N/A"}</span>
                      <br />
                      <span>
                        {order.address?.city && order.address?.state
                          ? `${order.address.city}, ${order.address.state}`
                          : "N/A"}
                      </span>
                      <br />
                      <span>{order.address?.phoneNumber || "N/A"}</span>
                    </p>
                  </div>

                  {/* Tổng tiền */}
                  <div className="flex-1 text-center">
                    <p className="font-medium text-lg">
                      {formatCurrency(order.amount, currency)}
                    </p>
                  </div>

                  {/* Trạng thái, ngày, và hành động */}
                  <div className="flex-1 text-right">
                    <p className="flex flex-col items-end gap-2">
                      <span>
                        Phương thức: {getPaymentMethodText(order.paymentMethod)}
                      </span>
                      <span>
                        Ngày: {new Date(order.date).toLocaleDateString("vi-VN")}
                      </span>
                      <span>
                        Trạng thái:{" "}
                        {getStatusText(order.status, order.ghnTrackingCode)}
                      </span>
                      <span>Mã theo dõi: {order.trackingCode || "N/A"}</span>
                      {(order.status === "pending" ||
                        (order.status === "paid" &&
                          order.trackingCode?.startsWith("TEMP-"))) && (
                        <button
                          onClick={() => handleAction(order._id, "confirm")}
                          className="mt-2 bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                        >
                          Xác nhận
                        </button>
                      )}
                      {(order.status === "pending" ||
                        (order.status === "paid" &&
                          order.trackingCode?.startsWith("TEMP-"))) && (
                        <button
                          onClick={() => handleAction(order._id, "cancel")}
                          className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                        >
                          Hủy
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Orders;
