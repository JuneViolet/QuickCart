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

// const MyOrders = () => {
//   const { currency, getToken, user } = useAppContext();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchOrders = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get("/api/order/list", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) {
//         console.log("MyOrders Data:", data.orders); // Log để kiểm tra
//         setOrders(data.orders.reverse());
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false); // Đảm bảo tắt loading
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       fetchOrders();
//     }
//   }, [user]);

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
//                     key={order._id} // Sửa: Dùng order._id
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
//                                 : `Unknown Product x ${item.quantity}`
//                             )
//                             .join(", ")}
//                         </span>
//                         <span>Sản Phẩm : {order.items.length}</span>
//                       </p>
//                     </div>
//                     <div>
//                       <p>
//                         <span className="font-medium">
//                           {order.address?.fullName || "Unknown Name"}
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
//                       {currency}
//                       {order.amount}
//                     </p>
//                     <div>
//                       <p className="flex flex-col">
//                         <span>Method : COD</span>
//                         <span>
//                           Date : {new Date(order.date).toLocaleDateString()}
//                         </span>
//                         <span>Payment : Pending</span>
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
import { useUser } from "@clerk/nextjs"; // Thêm useUser để lấy isLoaded

const MyOrders = () => {
  const { currency, getToken, user, formatCurrency, router } = useAppContext();
  const { isLoaded } = useUser(); // Lấy isLoaded từ useUser
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      console.log("Token trong MyOrders:", token);
      console.log("Người dùng trong MyOrders:", user);
      if (!token) {
        toast.error("Vui lòng đăng nhập để xem đơn hàng của bạn");
        router.push("/sign-in");
        return;
      }
      const { data } = await axios.get("/api/order/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Phản hồi API:", data);
      if (data.success) {
        console.log("Dữ liệu MyOrders:", data.orders);
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
        toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        router.push("/sign-in");
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) {
      console.log("Đang đợi Clerk tải dữ liệu người dùng...");
      return; // Chờ Clerk tải xong trạng thái đăng nhập
    }
    if (user) {
      console.log("Đối tượng người dùng:", user);
      fetchOrders();
    } else {
      console.log(
        "Không tìm thấy người dùng, chuyển hướng đến trang đăng nhập"
      );
      router.push("/sign-in");
    }
  }, [user, isLoaded]); // Thêm isLoaded vào dependency array

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
                            .map((item) =>
                              item.product?.name
                                ? `${item.product.name} x ${item.quantity}`
                                : `Sản phẩm không xác định x ${item.quantity}`
                            )
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
                        <span>Thanh toán: Đang chờ</span>
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
