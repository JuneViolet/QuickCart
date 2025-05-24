// import mongoose from "mongoose";

// const specificationTemplateSchema = new mongoose.Schema({
//   categoryId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Category",
//     required: true,
//   },
//   specs: [{ type: String, required: true }], // Danh sách các thông số hợp lệ (ví dụ: ["chip", "RAM", "ROM"])
// });

// const SpecificationTemplate =
//   mongoose.models.SpecificationTemplate ||
//   mongoose.model("SpecificationTemplate", specificationTemplateSchema);

// export default SpecificationTemplate;
import mongoose from "mongoose";

const specificationTemplateSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  specs: [
    {
      name: { type: String, required: true }, // Tên thông số (ví dụ: "chip")
      description: { type: String }, // Mô tả (tùy chọn)
      type: {
        type: String,
        enum: ["string", "number", "array"],
        default: "string",
      }, // Loại giá trị
    },
  ],
});

const SpecificationTemplate =
  mongoose.models.SpecificationTemplate ||
  mongoose.model("SpecificationTemplate", specificationTemplateSchema);

export default SpecificationTemplate;
