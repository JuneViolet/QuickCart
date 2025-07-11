// // // // models/Product.js
// import mongoose from "mongoose";

// const reviewSchema = new mongoose.Schema({
//   userId: { type: String, required: true, ref: "User" },
//   username: { type: String, required: true },
//   rating: { type: Number, required: true, min: 1, max: 5 },
//   comment: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// const productSchema = new mongoose.Schema({
//   userId: { type: String, required: true, ref: "User" },
//   name: { type: String, required: true },
//   slug: { type: String, unique: true, sparse: true },
//   description: { type: String, required: true },
//   price: { type: Number, required: true }, // Giá gốc chung
//   offerPrice: { type: Number }, // Giá khuyến mãi chung (không bắt buộc)
//   images: {
//     type: [String],
//     default: [], // Cho phép rỗng
//     // Xóa validation yêu cầu không rỗng
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Category",
//     required: true,
//   },
//   createdAt: { type: Date, default: Date.now },
//   reviews: { type: [reviewSchema], default: [] },
//   // Xóa stock vì nó được quản lý qua Variant
//   brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
//   specifications: [
//     { type: mongoose.Schema.Types.ObjectId, ref: "Specification" },
//   ],
//   relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
//   variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variant" }],
//   // Xóa attributes vì nó được quản lý qua model Attribute
//   productType: {
//     type: String,
//     enum: ["phone", "headphone", "camera", "other"],
//     default: "other",
//   },
// });

// const Product =
//   mongoose.models.Product || mongoose.model("Product", productSchema);
// export default Product;
// models/Product.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "User" },
  username: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "User" },
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number },
  images: { type: [String], default: [] },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  reviews: { type: [reviewSchema], default: [] },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
  specifications: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Specification" },
  ],
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variant" }],
  productType: {
    type: String,
    enum: ["phone", "headphone", "camera", "other"],
    default: "other",
  },
  keywords: { type: [String], default: [], index: true }, // Thêm trường keywords
});

// Tạo chỉ mục full-text cho các trường quan trọng
// productSchema.index({ name: "text", description: "text", category: "text", keywords: "text" });
productSchema.index({ name: "text", description: "text", keywords: "text" });
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
