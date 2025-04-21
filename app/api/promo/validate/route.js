// app/api/promo/validate/route.js
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Danh sách mã giảm giá giả lập 
const promoCodes = {
  DISCOUNT10: 0.1, // Giảm 10%
  SAVE20: 20, // Giảm $20
};

export async function POST(req) {
  try {
    // Kiểm tra authentication (dùng Clerk)
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Lấy body từ request
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Mã khuyến mãi bắt buộc" },
        { status: 400 }
      );
    }

    const discount = promoCodes[code.toUpperCase()];
    if (discount) {
      return NextResponse.json({
        success: true,
        discountPercentage: discount,
        message: "Mã khuyến mại đã được áp dụng thành công",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Mã khuyến mại không hợp lệ" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
