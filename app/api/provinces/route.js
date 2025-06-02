import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Đọc dữ liệu từ file JSON
const tinhTpData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "public/data/tinh_tp.json"), "utf8")
);
const quanHuyenData = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "public/data/quan_huyen.json"),
    "utf8"
  )
);
const phuongXaData = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "public/data/phuong_xa.json"),
    "utf8"
  )
);

// Chỉ trả về danh sách tỉnh
const provincesArray = Object.values(tinhTpData).map((tinh) => ({
  name: tinh.name,
  code: tinh.code,
}));

export async function GET() {
  return NextResponse.json({ success: true, data: provincesArray });
}
