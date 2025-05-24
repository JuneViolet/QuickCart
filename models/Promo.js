// import mongoose from "mongoose";

// const promoSchema = new mongoose.Schema({
//   code: {
//     type: String,
//     required: true,
//     unique: true,
//     uppercase: true,
//   },
//   discount: {
//     type: Number,
//     required: true,
//   },
//   expiresAt: {
//     type: Date,
//   },
//   maxUses: {
//     type: Number,
//   },
//   usedCount: {
//     type: Number,
//     default: 0,
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//   },
// });

// // Gán model vào biến Promo trước khi export
// const Promo = mongoose.models.Promo || mongoose.model("Promo", promoSchema);
// export default Promo;
import mongoose from "mongoose";

const promoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discount: { type: Number, required: true },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage",
  },
  description: { type: String, default: "" },
  expiresAt: { type: Date },
  maxUses: { type: Number },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const Promo = mongoose.models.Promo || mongoose.model("Promo", promoSchema);
export default Promo;
