// "use client";
// import React, { useState, useEffect } from "react";

// const OrderManagement = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const response = await fetch("/api/orders"); // API lấy danh sách đơn hàng
//         const data = await response.json();
//         if (data.success) {
//           setOrders(data.orders);
//         }
//       } catch (error) {
//         console.error("Fetch Orders Error:", error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrders();
//   }, []);

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold">Order Management</h1>
//       {orders.length > 0 ? (
//         <table className="w-full mt-4 border-collapse">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="border p-2">Order ID</th>
//               <th className="border p-2">Customer</th>
//               <th className="border p-2">Status</th>
//               <th className="border p-2">Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((order) => (
//               <tr key={order._id} className="border">
//                 <td className="border p-2">{order._id}</td>
//                 <td className="border p-2">{order.customerName}</td>
//                 <td className="border p-2">{order.status}</td>
//                 <td className="border p-2">{order.total}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>Không có đơn hàng nào.</p>
//       )}
//     </div>
//   );
// };

// export default OrderManagement;
