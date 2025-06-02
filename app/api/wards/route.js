import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request) {
  try {
    // Đọc dữ liệu từ file JSON
    let phuongXaData = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "public/data/phuong_xa.json"),
        "utf8"
      )
    );

    // Chuyển object thành mảng nếu cần
    phuongXaData = Array.isArray(phuongXaData)
      ? phuongXaData
      : Object.values(phuongXaData);

    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get("district");

    if (!districtId) {
      return NextResponse.json(
        { success: false, message: "District ID is required" },
        { status: 400 }
      );
    }

    const wards = phuongXaData
      .filter((xa) => xa.parent_code === districtId) // Sửa parent_id thành parent_code
      .map((xa) => ({
        name: xa.name,
      }));

    return NextResponse.json({ success: true, data: wards });
  } catch (error) {
    console.error("Wards API Error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch wards" },
      { status: 500 }
    );
  }
}
