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
