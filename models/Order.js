// import mongoose from "mongoose";
// import Address from "./Address"; // Import để đảm bảo model được load

// const orderSchema = new mongoose.Schema({
//   userId: { type: String, required: true, ref: "user" },
//   items: [
//     {
//       product: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: "Product",
//       },
//       quantity: { type: Number, required: true },
//     },
//   ],
//   amount: { type: Number, required: true },
//   address: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Address",
//     required: true,
//   }, // Sửa thành ObjectId
//   status: { type: String, required: true, default: "Order Placed" }, // Khôi phục như cũ
//   date: { type: Number, required: true },
// });

// // Sử dụng try-catch để tránh overwrite
// let Order;
// try {
//   Order = mongoose.model("Order");
// } catch {
//   Order = mongoose.model("Order", orderSchema);
// }

// export default Order;
import mongoose from "mongoose";
import Address from "./Address";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "User" }, // Sửa ref thành "User"
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      quantity: { type: Number, required: true },
    },
  ],
  amount: { type: Number, required: true },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  trackingCode: { type: String }, // Thêm trường để lưu mã vận đơn từ GHTK
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "canceled"],
    default: "pending",
  },
  date: { type: Date, required: true, default: Date.now }, // Chuyển sang Date
});

let Order;
try {
  Order = mongoose.model("Order");
} catch {
  Order = mongoose.model("Order", orderSchema);
}

export default Order;
