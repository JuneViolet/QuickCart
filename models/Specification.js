import mongoose from "mongoose";
import SpecificationTemplate from "./SpecificationTemplate"; // Đảm bảo import

const specificationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  key: {
    type: String,
    required: true,
    validate: {
      validator: async function (value) {
        if (!this.categoryId) {
          return false; // Nếu categoryId không có, validation thất bại
        }
        const template = await SpecificationTemplate.findOne({
          categoryId: this.categoryId,
        });
        if (!template) {
          return false; // Nếu không tìm thấy template, validation thất bại
        }
        return template.specs.some((spec) => spec.name === value);
      },
      message: "Key must be valid according to the category template",
    },
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

const Specification =
  mongoose.models.Specification ||
  mongoose.model("Specification", specificationSchema);

export default Specification;
