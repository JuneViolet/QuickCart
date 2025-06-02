"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";

const AdminOrdersPage = () => {
  const { getToken } = useAppContext();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get("/api/order/seller-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Fetch Orders Error:", error.message);
      }
    };
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = await getToken();
      const { data } = await axios.put(
        "/api/order/update-status",
        { orderId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status } : order
          )
        );
      }
    } catch (error) {
      console.error("Update Order Status Error:", error.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium">Quản Lý Đơn Hàng</h1>
      {orders.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order._id} className="border p-4 rounded">
              <p>Mã đơn hàng: {order._id}</p>
              <p>Mã vận đơn: {order.trackingCode || "N/A"}</p>
              <p>Khách hàng: {order.address?.fullName || "N/A"}</p>
              <p>Trạng thái: {order.ghtkStatus || order.status}</p>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                className="mt-2 p-1 border rounded"
              >
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="shipped">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="canceled">Đã hủy</option>
              </select>
            </li>
          ))}
        </ul>
      ) : (
        <p>Chưa có đơn hàng nào.</p>
      )}
    </div>
  );
};

export default AdminOrdersPage;
