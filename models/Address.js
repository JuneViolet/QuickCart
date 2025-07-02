// import mongoose from "mongoose";

// const addressSchema = new mongoose.Schema({
//   userId: {
//     type: String, // Thay đổi từ ObjectId thành String
//     required: true,
//     index: true, // Thêm index để tăng tốc truy vấn
//   },
//   fullName: { type: String, required: true },
//   phoneNumber: { type: String, required: true },
//   pincode: { type: String, required: true },
//   area: { type: String, required: true },
//   city: { type: String, required: true },
//   state: { type: String, required: true },
//   ward: { type: String },
//   isDefault: { type: Boolean, default: false },
// });

// // Sử dụng try-catch để tránh overwrite và đảm bảo model được đăng ký
// let Address;
// try {
//   Address = mongoose.model("Address");
// } catch {
//   Address = mongoose.model("Address", addressSchema);
// }

// export default Address;
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: {
    type: String, // Sử dụng String như yêu cầu
    required: true,
    index: true, // Index để tăng tốc truy vấn theo userId
  },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  pincode: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  ward: { type: String }, // Không bắt buộc, để trống nếu không có
  districtId: { type: String }, // Thêm trường cho GHN (mã quận/huyện)
  wardCode: { type: String }, // Thêm trường cho GHN (mã phường/xã)
  isDefault: { type: Boolean, default: false }, // Giữ nguyên
});

// Thêm index cho các trường thường xuyên tìm kiếm (tùy chọn)
addressSchema.index({ city: 1, state: 1 }); // Index composite cho city và state

// Sử dụng try-catch để tránh overwrite và đảm bảo model được đăng ký
let Address;
try {
  Address = mongoose.model("Address");
} catch {
  Address = mongoose.model("Address", addressSchema);
}

export default Address;
