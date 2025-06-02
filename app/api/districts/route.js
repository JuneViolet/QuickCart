import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request) {
  try {
    let quanHuyenData = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "public/data/quan_huyen.json"),
        "utf8"
      )
    );
    quanHuyenData = Array.isArray(quanHuyenData)
      ? quanHuyenData
      : Object.values(quanHuyenData);

    console.log("QuanHuyenData:", quanHuyenData);
    const { searchParams } = new URL(request.url);
    const provinceCode = searchParams.get("province");
    console.log("Province Code:", provinceCode);

    if (!provinceCode) {
      return NextResponse.json(
        { success: false, message: "Province code is required" },
        { status: 400 }
      );
    }

    const districts = quanHuyenData
      .filter((quan) => quan.parent_code === provinceCode) // Sửa parent_id thành parent_code
      .map((quan) => ({
        name: quan.name,
        id: quan.code, // Dùng code thay vì id để khớp với dữ liệu
      }));

    console.log("Filtered Districts:", districts);
    return NextResponse.json({ success: true, data: districts });
  } catch (error) {
    console.error("Districts API Error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch districts" },
      { status: 500 }
    );
  }
}
