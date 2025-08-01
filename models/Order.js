// // name: { type: String, required: true }, bắt buộc phải có
// // rating: { type: Number, required: true, min: 1, max: 5 }, giá trị hợp lệ
// // enum: ["phone", "headphone", "camera", "other"], giới hạn giá trị nằm trong tệp cho phép
// // category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, ràng buộc khóa ngoại
// // slug: { type: String, unique: true, sparse: true }, unique ràng buộc chỉ duy nhất
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
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
  // Thông tin mã giảm giá được áp dụng
  promoCode: { type: String },
  promoDiscount: { type: Number, default: 0 },
  promoType: { type: String, enum: ["percentage", "fixed"] },
  trackingCode: {
    type: String,
    unique: true,
    default: () => `TEMP-${Date.now()}`,
    index: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "paid",
      "confirmed",
      "shipped",
      "delivered",
      "canceled",
      "ghn_failed",
      "Chờ lấy hàng",
      "Đang giao",
      "Đã giao",
      "Đã hủy",
      "Chờ xác nhận",
    ],
    default: "pending",
  },
  paymentMethod: { type: String, default: "COD" },
  date: { type: Date, default: Date.now, required: true },
  ghnOrderId: { type: String },
  ghnError: { type: String },
});

// Thêm index composite cho userId và items.product
orderSchema.index({ userId: 1, "items.product": 1 });

let Order;
try {
  Order = mongoose.model("Order");
} catch {
  Order = mongoose.model("Order", orderSchema);
}

export default Order;
