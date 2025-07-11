//bản ổn đinh
import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      unique: true,
    },
    values: {
      type: [mongoose.Schema.Types.Mixed], // 👈 Cho phép cả object hoặc string
      required: [true, "Values are required"],
      validate: { 
        validator: (v) => v && v.length > 0,
        message: "Values array cannot be empty",
      },
    },
  },
  { timestamps: true }
);

const Attribute =
  mongoose.models.Attribute || mongoose.model("Attribute", attributeSchema);
export default Attribute;
