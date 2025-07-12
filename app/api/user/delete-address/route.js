// import connectDB from "@/config/db";
// import User from "@/models/User";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   try {
//     await connectDB();
//     const { addressId } = await request.json();
//     const token = request.headers.get("authorization")?.split(" ")[1];

//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const user = await User.findOne({ clerkId: token }); // Giả sử dùng clerkId để xác thực
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Xóa địa chỉ khỏi mảng addresses
//     user.addresses = user.addresses.filter(
//       (a) => a._id.toString() !== addressId
//     );
//     await user.save();

//     return NextResponse.json({
//       success: true,
//       message: "Địa chỉ đã được xóa",
//       addresses: user.addresses,
//     });
//   } catch (error) {
//     console.error("Error deleting address:", error);
//     return NextResponse.json(
//       { success: false, message: "Lỗi khi xóa địa chỉ" },
//       { status: 500 }
//     );
//   }
// }
