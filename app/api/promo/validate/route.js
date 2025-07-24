// import connectDB from "@/config/db";
// import Promo from "@/models/Promo";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     await connectDB();
//     const { userId } = getAuth(req);
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { code } = await req.json();

//     if (!code) {
//       return NextResponse.json(
//         { success: false, message: "Mã khuyến mãi bắt buộc" },
//         { status: 400 }
//       );
//     }

//     const promo = await Promo.findOne({
//       code: code.toUpperCase(),
//       isActive: true,
//     });
//     if (!promo) {
//       return NextResponse.json(
//         { success: false, message: "Mã khuyến mại không hợp lệ" },
//         { status: 400 }
//       );
//     }

//     // Kiểm tra ngày hết hạn (nếu có)
//     if (promo.expiresAt && new Date() > promo.expiresAt) {
//       return NextResponse.json(
//         { success: false, message: "Mã khuyến mại đã hết hạn" },
//         { status: 400 }
//       );
//     }

//     // Kiểm tra giới hạn sử dụng (nếu có)
//     if (promo.maxUses && promo.usedCount >= promo.maxUses) {
//       return NextResponse.json(
//         { success: false, message: "Mã khuyến mại đã hết lượt sử dụng" },
//         { status: 400 }
//       );
//     }

//     // Tăng số lần sử dụng (nếu cần)
//     await Promo.findOneAndUpdate(
//       { code: code.toUpperCase() },
//       { $inc: { usedCount: 1 } },
//       { new: true }
//     );

//     return NextResponse.json({
//       success: true,
//       discountPercentage: promo.discount,
//       message: "Mã khuyến mại đã được áp dụng thành công",
//     });
//   } catch (error) {
//     console.error("Error validating promo:", error);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
import connectDB from "@/config/db";
import Promo from "@/models/Promo";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { code, totalAmount } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Mã khuyến mãi bắt buộc" },
        { status: 400 }
      );
    }
    if (totalAmount === undefined || totalAmount < 0) {
      return NextResponse.json(
        { success: false, message: "Tổng giá trị đơn hàng không hợp lệ" },
        { status: 400 }
      );
    }

    const promo = await Promo.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });
    console.log("Promo Data:", promo); // Log để debug
    if (!promo) {
      return NextResponse.json(
        { success: false, message: "Mã khuyến mại không hợp lệ" },
        { status: 400 }
      );
    }

    // Kiểm tra ngày hết hạn (nếu có)
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return NextResponse.json(
        { success: false, message: "Mã khuyến mại đã hết hạn" },
        { status: 400 }
      );
    }

    // Kiểm tra giới hạn sử dụng (nếu có)
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json(
        { success: false, message: "Mã khuyến mại đã hết lượt sử dụng" },
        { status: 400 }
      );
    }

    // Kiểm tra giá trị đơn hàng dựa trên minOrderValue và maxOrderValue
    if (
      totalAmount < promo.minOrderValue ||
      totalAmount > promo.maxOrderValue
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Giá trị đơn hàng phải từ ${promo.minOrderValue} đến ${promo.maxOrderValue} VND`,
        },
        { status: 400 }
      );
    }

    // Tăng số lần sử dụng (nếu cần)
    await Promo.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    // Trả về discount dựa trên discountType
    const responseData = {
      success: true,
      discountPercentage:
        promo.discountType === "percentage" ? promo.discount : 0,
      discountAmount: promo.discountType === "fixed" ? promo.discount : 0,
      message: "Mã khuyến mại đã được áp dụng thành công",
    };
    console.log("Promo Validate Response Data:", responseData); // Log để debug
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error validating promo:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
