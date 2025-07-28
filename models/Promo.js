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
  minOrderValue: { type: Number, default: 0 }, // Giá trị tối thiểu để áp dụng (mặc định 0)
  maxOrderValue: { type: Number, default: Infinity }, // Giá trị tối đa để áp dụng (mặc định Infinity)
});

const Promo = mongoose.models.Promo || mongoose.model("Promo", promoSchema);
export default Promo;
