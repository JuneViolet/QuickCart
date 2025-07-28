import mongoose from "mongoose";
import Attribute from "./Attribute";

const variantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    price: { type: Number, required: true },
    offerPrice: { type: Number },
    stock: {
      type: Number,
      required: [true, "Số lượng tồn kho là bắt buộc"],
      min: [0, "Số lượng tồn kho không thể âm"],
      validate: {
        validator: function (value) {
          return Number.isInteger(value);
        },
        message: "Số lượng tồn kho phải là số nguyên",
      },
    },
    sku: { type: String, required: true },
    attributeRefs: [
      {
        attributeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
          required: true,
        },
        value: { type: String, required: true },
      },
    ],
    images: {
      type: [String], // Mảng URL ảnh
      validate: {
        validator: function (v) {
          return v.length <= 4; // Giới hạn tối đa 4 ảnh
        },
        message: "Maximum 4 images allowed",
      },
    },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Variant ||
  mongoose.model("Variant", variantSchema);
