// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Address from "@/models/Address";
// import { getAuth } from "@clerk/nextjs/server";

// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     await connectDB();
//     const addresses = await Address.find({ userId });
//     return NextResponse.json({ success: true, addresses });
//   } catch (error) {
//     console.error("Get Addresses Error:", error.message);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const addresses = await Address.find({ userId });
    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Get Addresses Error:", error.message);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tải địa chỉ" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { addressId } = await request.json(); // Nhận addressId từ client
    if (!addressId) {
      return NextResponse.json(
        { success: false, message: "Address ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const deletedAddress = await Address.findOneAndDelete({
      _id: addressId,
      userId,
    });
    if (!deletedAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Địa chỉ không tồn tại hoặc không thuộc về bạn",
        },
        { status: 404 }
      );
    }

    const remainingAddresses = await Address.find({ userId });
    return NextResponse.json({
      success: true,
      message: "Địa chỉ đã được xóa",
      addresses: remainingAddresses,
    });
  } catch (error) {
    console.error("Delete Address Error:", error.message);
    return NextResponse.json(
      { success: false, message: "Lỗi khi xóa địa chỉ" },
      { status: 500 }
    );
  }
}
