import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Tên hãng, đảm bảo không trùng lặp
  description: { type: String, default: "" }, // Mô tả hãng (tùy chọn)
  createdAt: { type: Date, default: Date.now },
});

const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema);

export default Brand;
