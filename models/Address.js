// import mongoose from "mongoose";

// const addressSchema = new mongoose.Schema({
//   userId: { type: String, require: true },
//   fullName: { type: String, require: true },
//   phoneNumber: { type: String, require: true },
//   pincode: { type: Number, require: true },
//   area: { type: String, require: true },
//   city: { type: String, require: true },
//   state: { type: String, require: true },
// });

// const Address =
//   mongoose.models.address || mongoose.model("address", addressSchema);

// export default Address;
// import mongoose from "mongoose";

// const addressSchema = new mongoose.Schema({
//   userId: { type: String, required: true },
//   fullName: { type: String, required: true },
//   phoneNumber: { type: String, required: true },
//   pincode: { type: Number, required: true },
//   area: { type: String, required: true },
//   city: { type: String, required: true },
//   state: { type: String, required: true },
// });

// // Sử dụng try-catch để tránh overwrite và đảm bảo model được đăng ký
// let Address;
// try {
//   Address = mongoose.model("Address"); // Thử lấy model đã tồn tại
// } catch {
//   Address = mongoose.model("Address", addressSchema); // Định nghĩa mới nếu chưa có
// }

// export default Address;
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: {
    type: String, // Thay đổi từ ObjectId thành String
    required: true,
    index: true, // Thêm index để tăng tốc truy vấn
  },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  pincode: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  ward: { type: String },
  isDefault: { type: Boolean, default: false },
});

// Sử dụng try-catch để tránh overwrite và đảm bảo model được đăng ký
let Address;
try {
  Address = mongoose.model("Address");
} catch {
  Address = mongoose.model("Address", addressSchema);
}

export default Address;
