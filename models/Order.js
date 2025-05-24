// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema({
//   userId: { type: String, required: true, ref: "user" },
//   items: [
//     {
//       product: { type: String, required: true, ref: "product" }, // không đc thì thử thêm s
//       quantity: { type: Number, required: true },
//     },
//   ],
//   amount: { type: Number, required: true },
//   address: { type: String, ref: "address", required: true },
//   status: { type: String, required: true, default: "Order Placed" },
//   date: { type: Number, required: true },
// });

// const Order = mongoose.models.order || mongoose.model("order", orderSchema);

// export default Order;
// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema({
//   userId: { type: String, required: true, ref: "user" },
//   items: [
//     {
//       product: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: "Product",
//       }, // Sửa thành ObjectId và ref: "Product"
//       quantity: { type: Number, required: true },
//     },
//   ],
//   amount: { type: Number, required: true },
//   address: { type: String, ref: "address", required: true }, // Giả định address là một ref, cần kiểm tra
//   status: { type: String, required: true, default: "Order Placed" },
//   date: { type: Number, required: true },
// });

// const Order = mongoose.models.Order || mongoose.model("Order", orderSchema); // Sửa thành Order

// export default Order;
import mongoose from "mongoose";
import Address from "./Address"; // Import để đảm bảo model được load

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "user" },
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
  }, // Sửa thành ObjectId
  status: { type: String, required: true, default: "Order Placed" }, // Khôi phục như cũ
  date: { type: Number, required: true },
});

// Sử dụng try-catch để tránh overwrite
let Order;
try {
  Order = mongoose.model("Order");
} catch {
  Order = mongoose.model("Order", orderSchema);
}

export default Order;
