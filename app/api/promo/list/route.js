// import connectDB from "@/config/db";
// import Promo from "@/models/Promo";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET(req) {
//   try {
//     await connectDB();
//     const { userId } = getAuth(req);

//     // Không cần kiểm tra quyền seller, chỉ cần xác thực user
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     // Lấy danh sách mã khuyến mãi hợp lệ
//     const currentDate = new Date();
//     const promos = await Promo.find({
//       isActive: true,
//       expiresAt: { $gte: currentDate }, // Chỉ lấy mã còn hạn
//       $or: [
//         { maxUses: { $exists: false } }, // Không giới hạn lượt dùng
//         { maxUses: { $gte: 1 } }, // Còn lượt dùng
//       ],
//     });

//     // Chuyển đổi dữ liệu để phù hợp với frontend
//     const promoCodes = promos.map((promo) => ({
//       code: promo.code,
//       discountPercentage:
//         promo.discountType === "percentage" ? promo.discount : 0,
//       discountAmount: promo.discountType === "fixed" ? promo.discount : 0,
//     }));

//     return NextResponse.json({ success: true, promoCodes });
//   } catch (error) {
//     console.error("GET Error:", error);
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

export async function GET(req) {
  try {
    await connectDB();
    const { userId } = getAuth(req);

    // Xác thực user
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Lấy tổng giá trị giỏ hàng từ query parameter
    const { searchParams } = new URL(req.url);
    const cartAmountParam = searchParams.get("cartAmount");
    if (
      !cartAmountParam ||
      isNaN(parseFloat(cartAmountParam)) ||
      parseFloat(cartAmountParam) < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Tổng giá trị giỏ hàng không hợp lệ" },
        { status: 400 }
      );
    }
    const cartAmount = parseFloat(cartAmountParam);

    // Lấy danh sách mã khuyến mãi hợp lệ sử dụng aggregation
    const currentDate = new Date();
    const promos = await Promo.aggregate([
      {
        $match: {
          isActive: true,
          expiresAt: { $gte: currentDate },
          $or: [
            { maxUses: { $exists: false } },
            { $expr: { $lt: ["$usedCount", "$maxUses"] } },
          ],
        },
      },
      {
        $match: {
          $and: [
            { minOrderValue: { $lte: cartAmount } },
            { maxOrderValue: { $gte: cartAmount } },
          ],
        },
      },
      {
        $project: {
          code: 1,
          discountPercentage: {
            $cond: {
              if: { $eq: ["$discountType", "percentage"] },
              then: "$discount",
              else: 0,
            },
          },
          discountAmount: {
            $cond: {
              if: { $eq: ["$discountType", "fixed"] },
              then: "$discount",
              else: 0,
            },
          },
          minOrderValue: 1,
          maxOrderValue: 1,
          isActive: 1,
          expiresAt: 1,
          usedCount: 1,
          maxUses: 1, // Thêm để debug
        },
      },
    ]);

    console.log("Raw Promo Data:", promos); // Log để kiểm tra dữ liệu

    return NextResponse.json({
      success: true,
      promoCodes: promos,
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
