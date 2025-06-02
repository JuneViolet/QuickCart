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

//     // Tìm địa chỉ mặc định của người dùng
//     // Giả định rằng model Address có trường isDefault để xác định địa chỉ mặc định
//     const address = await Address.findOne({ userId, isDefault: true });

//     if (!address) {
//       // Nếu không có địa chỉ mặc định, trả về địa chỉ đầu tiên hoặc null
//       const firstAddress = await Address.findOne({ userId });
//       return NextResponse.json({
//         success: true,
//         address: firstAddress || null,
//       });
//     }

//     return NextResponse.json({ success: true, address });
//   } catch (error) {
//     console.error("Error fetching default address:", error.message);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
// api/address/default/route.js
// api/address/default/route.js
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

    const address = await Address.findOne({ userId, isDefault: true });

    if (!address) {
      const firstAddress = await Address.findOne({ userId });
      return NextResponse.json({
        success: true,
        address: firstAddress || null,
      });
    }

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("Error fetching default address:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
