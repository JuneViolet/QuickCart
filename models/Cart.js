// import mongoose from "mongoose";

// const CartSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   items: [
//     {
//       productId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Product",
//         required: true,
//       },
//       quantity: {
//         type: Number,
//         required: true,
//         default: 1,
//       },
//     },
//   ],
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
import mongoose from "mongoose";
import Product from "./Product";
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
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
