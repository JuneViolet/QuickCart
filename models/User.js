// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   _id: { type: String, required: true },
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   imageUrl: { type: String, required: true },
//   cartItems: [
//     {
//       productId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Product",
//         required: true,
//       },
//       quantity: { type: Number, required: true, min: 1 },
//     },
//   ],
// });

// const User = mongoose.models.User || mongoose.model("User", userSchema);
// export default User;
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
