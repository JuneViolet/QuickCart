// import { NextResponse } from "next/server";
// import fs from "fs";
// import path from "path";

// // Đọc dữ liệu từ file JSON
// const tinhTpData = JSON.parse(
//   fs.readFileSync(path.join(process.cwd(), "public/data/tinh_tp.json"), "utf8")
// );
// const quanHuyenData = JSON.parse(
//   fs.readFileSync(
//     path.join(process.cwd(), "public/data/quan_huyen.json"),
//     "utf8"
//   )
// );
// const phuongXaData = JSON.parse(
//   fs.readFileSync(
//     path.join(process.cwd(), "public/data/phuong_xa.json"),
//     "utf8"
//   )
// );

// // Chỉ trả về danh sách tỉnh
// const provincesArray = Object.values(tinhTpData).map((tinh) => ({
//   name: tinh.name,
//   code: tinh.code,
// }));

// export async function GET() {
//   return NextResponse.json({ success: true, data: provincesArray });
// }
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const response = await axios.get(
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
      {
        headers: {
          Token: process.env.GHN_TOKEN,
        },
      }
    );
    const provinces = response.data.data.map((province) => ({
      name: province.ProvinceName,
      code: province.ProvinceID,
    }));

    return NextResponse.json({ success: true, data: provinces });
  } catch (error) {
    console.error("Error fetching provinces from GHN:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch provinces" },
      { status: 500 }
    );
  }
}
