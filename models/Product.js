// // models/Product.js
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
//   price: { type: Number, required: true },
//   offerPrice: { type: Number },
//   images: { type: [String], default: [] },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Category",
//     required: true,
//   },
//   createdAt: { type: Date, default: Date.now },
//   reviews: { type: [reviewSchema], default: [] },
//   brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
//   specifications: [
//     { type: mongoose.Schema.Types.ObjectId, ref: "Specification" },
//   ],
//   relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
//   variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variant" }],
//   productType: {
//     type: String,
//     enum: ["phone", "headphone", "camera", "other"],
//     default: "other",
//   },
//   keywords: { type: [String], default: [], index: true }, // Thêm trường keywords
// });

// // Middleware để tự động tạo slug và xử lý trùng lặp
// productSchema.pre("save", async function (next) {
//   if (this.isModified("name") || !this.slug) {
//     let baseSlug = this.name
//       .toLowerCase()
//       .normalize("NFD")
//       .replace(/[\u0300-\u036f]/g, "")
//       .replace(/[^a-z0-9\s-]/g, "")
//       .trim()
//       .replace(/\s+/g, "-");
//     let uniqueSlug = baseSlug;
//     let counter = 1;

//     // Kiểm tra trùng lặp
//     const checkSlug = async (slug) => {
//       const existing = await this.constructor.countDocuments({ slug });
//       return existing > 0 && slug !== this.slug; // Loại trừ chính nó nếu đang cập nhật
//     };

//     while (await checkSlug(uniqueSlug)) {
//       uniqueSlug = `${baseSlug}-${counter++}`;
//     }
//     this.slug = uniqueSlug;
//   }
//   next();
// });

// // Tạo chỉ mục full-text
// productSchema.index({ name: "text", description: "text", keywords: "text" });

// const Product =
//   mongoose.models.Product || mongoose.model("Product", productSchema);
// export default Product;
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "User" },
  username: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ratingSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "User" },
  username: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  updatedAt: { type: Date, default: Date.now },
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
  comments: { type: [commentSchema], default: [] }, // Mảng lưu các comment
  ratings: {
    type: [ratingSchema],
    default: [], // Loại bỏ validate để cho phép nhiều user rating
  }, // Mảng lưu các rating, kiểm soát bởi API
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
  keywords: { type: [String], default: [], index: true },
});

// Middleware để tự động tạo slug và xử lý trùng lặp
productSchema.pre("save", async function (next) {
  if (this.isModified("name") || !this.slug) {
    let baseSlug = this.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    let uniqueSlug = baseSlug;
    let counter = 1;

    const checkSlug = async (slug) => {
      const existing = await this.constructor.countDocuments({ slug });
      return existing > 0 && slug !== this.slug;
    };

    while (await checkSlug(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }
    this.slug = uniqueSlug;
  }
  next();
});

// Tạo chỉ mục full-text
productSchema.index({ name: "text", description: "text", keywords: "text" });

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
/////// sửa
