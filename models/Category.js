import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Tên loại, đảm bảo không trùng lặp
  description: { type: String, default: "" }, // Mô tả loại (tùy chọn)
  createdAt: { type: Date, default: Date.now },
});

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
