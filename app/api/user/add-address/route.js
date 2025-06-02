// import connectDB from "@/config/db";
// import Address from "@/models/Address";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   try {
//     const { userId } = getAuth(request);
//     const { address } = await request.json();

//     await connectDB();
//     const newAddress = await Address.create({ ...address, userId });

//     return NextResponse.json({
//       success: true,
//       message: "Địa chỉ đã được thêm thành công",
//       newAddress,
//     });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: error.message });
//   }
// }
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { address } = await request.json();
    if (
      !address.fullName ||
      !address.phoneNumber ||
      !address.area ||
      !address.city ||
      !address.state
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!/^\d{10,11}$/.test(address.phoneNumber)) {
      return NextResponse.json(
        { success: false, message: "Số điện thoại phải từ 10-11 chữ số" },
        { status: 400 }
      );
    }

    await connectDB();

    // Kiểm tra xem người dùng đã có địa chỉ nào chưa
    const existingAddresses = await Address.find({ userId });
    const isDefault = existingAddresses.length === 0; // Nếu chưa có địa chỉ, đặt địa chỉ mới làm mặc định

    const newAddress = new Address({
      userId,
      ...address,
      isDefault,
    });
    await newAddress.save();

    // Nếu địa chỉ mới được đặt làm mặc định, cập nhật các địa chỉ khác
    if (isDefault) {
      await Address.updateMany(
        { userId, _id: { $ne: newAddress._id } },
        { $set: { isDefault: false } }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Địa chỉ đã được thêm thành công",
    });
  } catch (error) {
    console.error("Error adding address:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
