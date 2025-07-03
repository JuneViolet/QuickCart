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
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
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
  trackingCode: { type: String, required: true, unique: true }, // Sẽ là mã GHN
  status: {
    type: String,
    enum: ["pending", "paid", "confirmed", "shipped", "delivered", "canceled"],
    default: "pending",
  },
  paymentMethod: { type: String, default: "COD" },
  date: { type: Date, default: Date.now, required: true },
});

// Xóa index thừa
// orderSchema.index({ trackingCode: 1 }, { unique: true }); // ❌ Đã xóa

let Order;
try {
  Order = mongoose.model("Order");
} catch {
  Order = mongoose.model("Order", orderSchema);
}

export default Order;
