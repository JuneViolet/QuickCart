// "use client";
// import React, { useEffect, useState } from "react";
// import { assets } from "@/assets/assets";
// import Image from "next/image";
// import { useAppContext } from "@/context/AppContext";
// import Footer from "@/components/Footer";
// import Navbar from "@/components/Navbar";
// import Loading from "@/components/Loading";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useUser } from "@clerk/nextjs";

// const MyOrders = () => {
//   const { currency, getToken, user, formatCurrency, router } = useAppContext();
//   const { isLoaded } = useUser();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchOrders = async () => {
//     try {
//       const token = await getToken();
//       if (!token) {
//         toast.error("Vui lòng đăng nhập để xem đơn hàng của bạn");
//         router.push("/sign-in");
//         return;
//       }
//       const { data } = await axios.get("/api/order/list", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) {
//         const updatedOrders = await Promise.all(
//           data.orders.map(async (order) => {
//             if (order.trackingCode) {
//               try {
//                 const { data: ghtkData } = await axios.post("/api/ghtk", {
//                   action: "trackOrder",
//                   payload: { trackingCode: order.trackingCode },
//                 });
//                 if (ghtkData.success) {
//                   return { ...order, ghtkStatus: ghtkData.data.status };
//                 }
//               } catch (error) {
//                 console.error("Track Order Error:", error.message);
//               }
//             }
//             return order;
//           })
//         );
//         setOrders(updatedOrders.reverse());
//       } else {
//         if (data.message === "Người dùng không được tìm thấy") {
//           toast.error(
//             "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
//           );
//           router.push("/sign-in");
//         } else {
//           toast.error(data.message);
//         }
//       }
//     } catch (error) {
//       console.error("Lỗi khi lấy đơn hàng:", error);
//       if (error.response?.status === 401) {
//         toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
//         router.push("/sign-in");
//       } else {
//         toast.error(error.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!isLoaded) {
//       console.log("Đang đợi Clerk tải dữ liệu người dùng...");
//       return;
//     }
//     if (user) {
//       fetchOrders();
//     } else {
//       router.push("/sign-in");
//     }
//   }, [user, isLoaded]);

//   return (
//     <>
//       <Navbar />
//       <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
//         <div className="space-y-5">
//           <h2 className="text-lg font-medium mt-6">Đơn Đặt Hàng</h2>
//           {loading ? (
//             <Loading />
//           ) : (
//             <div className="max-w-5xl border-t border-gray-300 text-sm">
//               {orders.length === 0 ? (
//                 <p className="text-gray-500">Không Tìm Thấy Đơn Đặt Hàng</p>
//               ) : (
//                 orders.map((order) => (
//                   <div
//                     key={order._id}
//                     className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300"
//                   >
//                     <div className="flex-1 flex gap-5 max-w-80">
//                       <Image
//                         className="max-w-16 max-h-16 object-cover"
//                         src={assets.box_icon}
//                         alt="box_icon"
//                       />
//                       <p className="flex flex-col gap-3">
//                         <span className="font-medium text-base">
//                           {order.items
//                             .map((item) =>
//                               item.product?.name
//                                 ? `${item.product.name} x ${item.quantity}`
//                                 : `Sản phẩm không xác định x ${item.quantity}`
//                             )
//                             .join(", ")}
//                         </span>
//                         <span>Sản Phẩm: {order.items.length}</span>
//                       </p>
//                     </div>
//                     <div>
//                       <p>
//                         <span className="font-medium">
//                           {order.address?.fullName || "Tên không xác định"}
//                         </span>
//                         <br />
//                         <span>{order.address?.area || "N/A"}</span>
//                         <br />
//                         <span>
//                           {order.address?.city && order.address?.state
//                             ? `${order.address.city}, ${order.address.state}`
//                             : "N/A"}
//                         </span>
//                         <br />
//                         <span>{order.address?.phoneNumber || "N/A"}</span>
//                       </p>
//                     </div>
//                     <p className="font-medium my-auto">
//                       {formatCurrency(order.amount)}
//                     </p>
//                     <div>
//                       <p className="flex flex-col">
//                         <span>Phương thức: COD</span>
//                         <span>
//                           Ngày: {new Date(order.date).toLocaleDateString()}
//                         </span>
//                         <span>
//                           Trạng thái: {order.ghtkStatus || order.status}
//                         </span>
//                       </p>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default MyOrders;
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
  const { currency, getToken, user, formatCurrency, router } = useAppContext(); // Loại bỏ variants và fetchAllVariants
  const { isLoaded } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      if (!token) {
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
            if (order.trackingCode) {
              try {
                const { data: ghtkData } = await axios.post("/api/ghtk", {
                  action: "trackOrder",
                  payload: { trackingCode: order.trackingCode },
                });
                if (ghtkData.success) {
                  return { ...order, ghtkStatus: ghtkData.data.status };
                }
              } catch (error) {
                console.error("Track Order Error:", error.message);
              }
            }
            return order;
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
        toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        router.push("/sign-in");
      } else {
        toast.error(error.message);
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
    // Tạo chuỗi biến thể từ attributeRefs (ví dụ: "(Trắng, 64GB)")
    const variantDetails = variant.attributeRefs
      .map((ref) => ref.value)
      .join(", ");
    return ` (${variantDetails})`;
  };

  useEffect(() => {
    if (!isLoaded) {
      console.log("Đang đợi Clerk tải dữ liệu người dùng...");
      return;
    }
    if (user) {
      fetchOrders();
    } else {
      router.push("/sign-in");
    }
  }, [user, isLoaded]);

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
                              ); // Sử dụng object Variant từ populate
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
                        <span>Phương thức: COD</span>
                        <span>
                          Ngày: {new Date(order.date).toLocaleDateString()}
                        </span>
                        <span>
                          Trạng thái:{" "}
                          {order.ghtkStatus || order.status || "Chưa cập nhật"}
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
