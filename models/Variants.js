// // models/Variants.js
// import mongoose from "mongoose";

// const variantSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Product",
//     required: true,
//   },
//   color: { type: String, required: true },
//   storage: { type: String }, // Không bắt buộc
//   price: { type: Number, required: true },
//   stock: { type: Number, default: 0 },
//   sku: { type: String, unique: true },
//   image: { type: String },
// });

// const Variant =
//   mongoose.models.Variant || mongoose.model("Variant", variantSchema);
// export default Variant;
import mongoose from "mongoose";
import Attribute from "./Attribute";
const variantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: { type: String, required: true, ref: "User" }, // Thêm để đồng bộ với Product
    attributeRefs: {
      type: [
        {
          attributeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attribute",
            required: true,
          },
          value: { type: String, required: true },
        },
      ],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0; // Đảm bảo có ít nhất một thuộc tính
        },
        message: "attributeRefs cannot be empty",
      },
    },
    price: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: "Price must be non-negative",
      },
    },
    offerPrice: {
      type: Number,
      validate: {
        validator: function (v) {
          return !v || v >= 0;
        },
        message: "Offer price must be non-negative",
      },
    },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, unique: true },
    image: { type: String },
  },
  { timestamps: true }
);

const Variant =
  mongoose.models.Variant || mongoose.model("Variant", variantSchema);
export default Variant;
