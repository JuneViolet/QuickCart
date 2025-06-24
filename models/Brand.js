// models/Brand.js
import mongoose from "mongoose";
import slugify from "slugify";

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true }, // Loại bỏ required: true, vì sẽ tạo tự động
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

BrandSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);

export default Brand;
