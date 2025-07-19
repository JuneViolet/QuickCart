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

// // Tạo chỉ mục full-text cho các trường quan trọng
// // productSchema.index({ name: "text", description: "text", category: "text", keywords: "text" });
// productSchema.index({ name: "text", description: "text", keywords: "text" });
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

    // Kiểm tra trùng lặp
    const checkSlug = async (slug) => {
      const existing = await this.constructor.countDocuments({ slug });
      return existing > 0 && slug !== this.slug; // Loại trừ chính nó nếu đang cập nhật
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
