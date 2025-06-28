// import mongoose from "mongoose";
// import Address from "./Address";

// const orderSchema = new mongoose.Schema({
//   userId: { type: String, required: true, ref: "User" }, // Sửa ref thành "User"
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
//   },
//   trackingCode: { type: String }, // Thêm trường để lưu mã vận đơn từ GHTK
//   status: {
//     type: String,
//     enum: ["pending", "confirmed", "shipped", "delivered", "canceled"],
//     default: "pending",
//   },
//   date: { type: Date, required: true, default: Date.now }, // Chuyển sang Date
// });

// let Order;
// try {
//   Order = mongoose.model("Order");
// } catch {
//   Order = mongoose.model("Order", orderSchema);
// }

// export default Order;
// //models/Order.js
// import mongoose from "mongoose";
// import Address from "./Address";

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: String, // Thay ObjectId bằng String
//     required: true,
//     ref: "User", // Vẫn giữ ref để populate nếu cần
//   },
//   items: [
//     {
//       product: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: "Product",
//       },
//       variantId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Variant",
//         required: true,
//       },
//       quantity: { type: Number, required: true },
//     },
//   ],
//   amount: { type: Number, required: true },
//   address: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Address",
//     required: true,
//   },
//   trackingCode: { type: String, required: true },
//   status: {
//     type: String,
//     enum: ["pending", "confirmed", "shipped", "delivered", "canceled"],
//     default: "pending",
//   },
//   date: { type: Date, default: Date.now },
// });

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
  userId: {
    type: String, // Giả sử dùng String từ Clerk, nếu dùng ObjectId thì thay bằng mongoose.Schema.Types.ObjectId
    required: true,
    // Nếu dùng ObjectId, thêm: ref: "User"
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
      brand: { type: String, required: true },
      sku: { type: String, required: true },
    },
  ],
  amount: { type: Number, required: true, min: 0 },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  trackingCode: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "canceled"],
    default: "pending",
  },
  date: { type: Date, default: Date.now, required: true },
});

// Thêm index unique cho trackingCode
orderSchema.index({ trackingCode: 1 }, { unique: true });

let Order;
try {
  Order = mongoose.model("Order");
} catch {
  Order = mongoose.model("Order", orderSchema);
}

export default Order;
