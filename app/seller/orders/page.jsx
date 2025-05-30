
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
  const { currency, getToken, user, formatCurrency } = useAppContext(); // Thêm formatCurrency
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
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
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
          <h2 className="text-lg font-medium">Đặt Hàng</h2>
          <div className="max-w-4xl rounded-md">
            {orders.length === 0 ? (
              <p className="text-gray-500">Không tìm thấy đơn hàng nào cho Seller</p>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300"
                >
                  <div className="flex-1 flex gap-5 max-w-80">
                    <Image
                      className="max-w-16 max-h-16 object-cover"
                      src={assets.box_icon}
                      alt="box_icon"
                    />
                    <p className="flex flex-col gap-3">
                      <span className="font-medium">
                        {order.items
                          .map((item) =>
                            item.product?.name
                              ? `${item.product.name} x ${item.quantity}`
                              : `Unknown Product x ${item.quantity}`
                          )
                          .join(", ")}
                      </span>
                      <span>Items : {order.items.length}</span>
                    </p>
                  </div>
                  <div>
                    <p>
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
                  <p className="font-medium my-auto">
                    {formatCurrency(order.amount)} {/* Sử dụng formatCurrency */}
                  </p>
                  <div>
                    <p className="flex flex-col">
                      <span>Method : COD</span>
                      <span>
                        Date : {new Date(order.date).toLocaleDateString()}
                      </span>
                      <span>Payment : Pending</span>
                    </p>
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