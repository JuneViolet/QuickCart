// import mongoose from "mongoose";

// const CategorySchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
//   description: { type: String, default: "" },
//   createdAt: { type: Date, default: Date.now },
// });

// const Category =
//   mongoose.models.Category || mongoose.model("Category", CategorySchema);

// export default Category;
// models/Category.js
import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, sparse: true }, // Thêm slug, không bắt buộc
  description: { type: String, default: "" },
  subcategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Tham chiếu đến chính nó để tạo danh mục con
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

export default Category;
