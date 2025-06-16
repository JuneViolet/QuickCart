// import mongoose from "mongoose";

// const attributeSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   values: { type: [String], required: true },
// });

// const Attribute =
//   mongoose.models.Attribute || mongoose.model("Attribute", attributeSchema);
// export default Attribute;
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
      type: [String],
      required: [true, "Values are required"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Values array cannot be empty",
      },
    },
  },
  { timestamps: true }
);

const Attribute =
  mongoose.models.Attribute || mongoose.model("Attribute", attributeSchema);
export default Attribute;
