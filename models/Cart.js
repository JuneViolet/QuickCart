import mongoose from "mongoose";
import Product from "./Product";
import Variant from "./Variants";

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        validate: {
          validator: async function (value) {
            const product = await Product.findById(value);
            return !!product;
          },
          message: "Product not found",
        },
      },
      variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
        required: true,
        validate: {
          validator: async function (value) {
            const variant = await Variant.findById(value);
            return !!variant;
          },
          message: "Variant not found",
        },
      },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
