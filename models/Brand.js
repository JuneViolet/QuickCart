// // models/Brand.js
// import mongoose from "mongoose";

// const BrandSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true }, // Tên hãng, đảm bảo không trùng lặp
//   description: { type: String, default: "" }, // Mô tả hãng (tùy chọn)
//   category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Liên kết với Category (tùy chọn)
//   createdAt: { type: Date, default: Date.now },
// });

// const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);

// export default Brand;
// models/Brand.js
// import mongoose from "mongoose";

// const BrandSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
//   slug: { type: String, required: true, unique: true }, // Thêm trường slug
//   description: { type: String, default: "" },
//   category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
//   createdAt: { type: Date, default: Date.now },
// });

// const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);

// export default Brand;
// models/Brand.js
// models/Brand.js
import mongoose from "mongoose";
import slugify from "slugify";

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
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
