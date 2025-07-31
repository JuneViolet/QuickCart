import connectDB from "@/config/db";
import Promo from "@/models/Promo";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authSeller from "@/lib/authSeller";

// GET - Lấy danh sách mã khuyến mãi
export async function GET(req) {
  try {
    await connectDB();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const promos = await Promo.find();
    return NextResponse.json({ success: true, promos });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Tạo mã mới
export async function POST(req) {
  try {
    await connectDB();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const {
      code,
      discount,
      discountType,
      description,
      expiresAt,
      maxUses,
      isActive,
      minOrderValue,
      maxOrderValue,
    } = await req.json();
    console.log("POST request data:", {
      code,
      discount,
      discountType,
      description,
      expiresAt,
      maxUses,
      isActive,
      minOrderValue,
      maxOrderValue,
    }); // Log để kiểm tra

    if (!code || discount === undefined) {
      return NextResponse.json(
        { success: false, message: "Code and discount are required" },
        { status: 400 }
      );
    }

    const existingPromo = await Promo.findOne({ code: code.toUpperCase() });
    if (existingPromo) {
      return NextResponse.json(
        { success: false, message: "Mã Giảm Giá Đã Tồn Tại" },
        { status: 400 }
      );
    }

    const discountValue = parseFloat(discount);
    if (isNaN(discountValue) || discountValue <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "số tiền giảm giá phải lớn hơn 0",
        },
        { status: 400 }
      );
    }

    const maxUsesValue = parseFloat(maxUses);
    if (isNaN(maxUsesValue) || maxUsesValue <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Số lần sử dụng tối đa phải lớn hơn 0",
        },
        { status: 400 }
      );
    }

    const promo = new Promo({
      code: code.toUpperCase(),
      discount,
      discountType: discountType || "percentage",
      description: description || "",
      expiresAt,
      maxUses,
      isActive,
      minOrderValue:
        minOrderValue !== undefined ? parseFloat(minOrderValue) : 0, // Xử lý giá trị mặc định
      maxOrderValue:
        maxOrderValue !== undefined ? parseFloat(maxOrderValue) : Infinity, // Xử lý giá trị mặc định
    });

    await promo.save();
    console.log("Saved promo:", promo);

    return NextResponse.json({
      success: true,
      message: "Promo code created",
      promo,
    });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật mã
export async function PUT(req) {
  try {
    await connectDB();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const {
      code,
      discount,
      discountType,
      description,
      expiresAt,
      maxUses,
      isActive,
      minOrderValue,
      maxOrderValue,
    } = await req.json();
    console.log("PUT request data:", {
      code,
      discount,
      discountType,
      description,
      expiresAt,
      maxUses,
      isActive,
      minOrderValue,
      maxOrderValue,
    });

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Code is required" },
        { status: 400 }
      );
    }

    const promo = await Promo.findOneAndUpdate(
      { code: code.toUpperCase() },
      {
        discount,
        discountType: discountType || "percentage",
        description: description || "",
        expiresAt,
        maxUses,
        ...(isActive !== undefined && { isActive }),
        ...(minOrderValue !== undefined && {
          minOrderValue: parseFloat(minOrderValue),
        }),
        ...(maxOrderValue !== undefined && {
          maxOrderValue: parseFloat(maxOrderValue),
        }),
      },
      { new: true, runValidators: true }
    );

    if (!promo) {
      return NextResponse.json(
        { success: false, message: "Promo code not found" },
        { status: 404 }
      );
    }

    console.log("Updated promo:", promo);
    return NextResponse.json({
      success: true,
      message: "Promo code updated",
      promo,
    });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Xoá mã
export async function DELETE(req) {
  try {
    await connectDB();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json(
        { success: false, message: "Code is required" },
        { status: 400 }
      );
    }

    const promo = await Promo.findOneAndDelete({ code: code.toUpperCase() });

    if (!promo) {
      return NextResponse.json(
        { success: false, message: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Promo code deleted",
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
