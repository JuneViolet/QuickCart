// import mongoose from "mongoose";

// // Schema cho đánh giá (review)
// const reviewSchema = new mongoose.Schema({
//   userId: { type: String, required: true, ref: "user" },
//   rating: { type: Number, required: true, min: 1, max: 5 },
//   comment: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// // Schema chính cho sản phẩm
// const productSchema = new mongoose.Schema({
//   userId: { type: String, required: true, ref: "user" },
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   price: { type: Number, required: true },
//   offerPrice: { type: Number, required: true },
//   image: { type: Array, required: true },
//   category: { type: String, required: true },
//   date: { type: Number, required: true },
//   reviews: [reviewSchema], // Mảng các đánh giá
//   stock: { type: Number, required: true, default: 0 }, // Số lượng sản phẩm trong kho
//   brand: { type: String, required: true }, // Hãng sản phẩm (iPhone, Samsung,...)
// });

// const Product =
//   mongoose.models.product || mongoose.model("product", productSchema);

// export default Product;
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "user" },
  username: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "user" },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  image: { type: [String], required: true },
  category: { type: String, required: true },
  date: { type: Number, required: true },
  reviews: { type: [reviewSchema], default: [] }, // Thêm default: []
  stock: { type: Number, required: true, default: 0 },
  brand: { type: String, required: true },
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
