// models/BrandCategory.js
import mongoose from "mongoose";

const BrandCategorySchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

// Đảm bảo không trùng lặp (brandId, categoryId)
BrandCategorySchema.index({ brandId: 1, categoryId: 1 }, { unique: true });

const BrandCategory =
  mongoose.models.BrandCategory ||
  mongoose.model("BrandCategory", BrandCategorySchema);

export default BrandCategory;
