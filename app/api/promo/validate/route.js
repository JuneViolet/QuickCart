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

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Mã khuyến mãi bắt buộc" },
        { status: 400 }
      );
    }

    const promo = await Promo.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });
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

    // Tăng số lần sử dụng (nếu cần)
    await Promo.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      discountPercentage: promo.discount,
      message: "Mã khuyến mại đã được áp dụng thành công",
    });
  } catch (error) {
    console.error("Error validating promo:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
