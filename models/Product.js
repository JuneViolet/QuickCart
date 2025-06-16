// // models/Product.js
// import mongoose from "mongoose";

// const reviewSchema = new mongoose.Schema({
//   userId: { type: String, required: true, ref: "user" },
//   username: { type: String, required: true },
//   rating: { type: Number, required: true, min: 1, max: 5 },
//   comment: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// const productSchema = new mongoose.Schema({
//   userId: { type: String, required: true, ref: "user" },
//   name: { type: String, required: true },
//   slug: { type: String, unique: true, sparse: true }, // Thêm slug (tùy chọn)
//   description: { type: String, required: true },
//   price: { type: Number, required: true },
//   offerPrice: { type: Number, required: true },
//   images: {
//     type: [String],
//     required: true,
//     validate: {
//       validator: function (v) {
//         return v && v.length > 0; // Đảm bảo mảng images không rỗng
//       },
//       message: "Images array cannot be empty",
//     },
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Category",
//     required: true,
//   },
//   createdAt: { type: Date, default: Date.now }, // Thay date bằng createdAt
//   reviews: { type: [reviewSchema], default: [] },
//   stock: { type: Number, required: true, default: 0 },
//   brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
//   specifications: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Specification",
//     },
//   ],
//   relatedProducts: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//     },
//   ],
// });

// const Product =
//   mongoose.models.Product || mongoose.model("Product", productSchema);

// export default Product;
// models/Product.js
//test biến thể
// // models/Product.js
// import mongoose from "mongoose";
// import Variant from "./Variants";

// const reviewSchema = new mongoose.Schema({
//   userId: { type: String, required: true, ref: "user" },
//   username: { type: String, required: true },
//   rating: { type: Number, required: true, min: 1, max: 5 },
//   comment: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// const productSchema = new mongoose.Schema({
//   userId: { type: String, required: true, ref: "user" },
//   name: { type: String, required: true },
//   slug: { type: String, unique: true, sparse: true },
//   description: { type: String, required: true },
//   price: { type: Number, required: true },
//   offerPrice: { type: Number, required: true },
//   images: {
//     type: [String],
//     required: true,
//     validate: {
//       validator: function (v) {
//         return v && v.length > 0;
//       },
//       message: "Images array cannot be empty",
//     },
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Category",
//     required: true,
//   },
//   createdAt: { type: Date, default: Date.now },
//   reviews: { type: [reviewSchema], default: [] },
//   stock: { type: Number, default: 0 },
//   brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
//   specifications: [
//     { type: mongoose.Schema.Types.ObjectId, ref: "Specification" },
//   ],
//   relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
//   variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variant" }],
//   attributes: {
//     type: [
//       {
//         name: { type: String, required: true },
//         values: { type: [String], default: [] },
//       },
//     ],
//     default: [
//       { name: "Màu sắc", values: ["Vàng", "Đỏ", "Xanh"] },
//       { name: "Dung lượng", values: ["256GB", "512GB", "1TB"] },
//     ],
//   },
//   productType: {
//     type: String,
//     enum: ["phone", "headphone", "camera", "other"],
//     default: "other",
//   },
// });

// const Product =
//   mongoose.models.Product || mongoose.model("Product", productSchema);
// export default Product;
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
  price: { type: Number, required: true }, // Giá gốc chung
  offerPrice: { type: Number }, // Giá khuyến mãi chung (không bắt buộc)
  images: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "Images array cannot be empty",
    },
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  reviews: { type: [reviewSchema], default: [] },
  // Xóa stock vì nó được quản lý qua Variant
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
  specifications: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Specification" },
  ],
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variant" }],
  // Xóa attributes vì nó được quản lý qua model Attribute
  productType: {
    type: String,
    enum: ["phone", "headphone", "camera", "other"],
    default: "other",
  },
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
