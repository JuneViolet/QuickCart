import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const { districtId, wardCode, address, weight, value } =
      await request.json();

    if (!districtId || !wardCode || !weight || !value) {
      console.log("Missing required fields:", {
        districtId,
        wardCode,
        weight,
        value,
      });
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const toDistrictId = parseInt(districtId);
    if (isNaN(toDistrictId)) {
      console.log("Invalid districtId:", districtId);
      return NextResponse.json(
        { success: false, message: "Invalid district ID" },
        { status: 400 }
      );
    }

    const headers = {
      "Content-Type": "application/json",
      Token: process.env.GHN_TOKEN,
      ShopId: process.env.GHN_SHOP_ID,
    };

    const payload = {
      service_type_id: 2, // Cần kiểm tra tài liệu GHN để lấy service_id hợp lệ
      to_district_id: toDistrictId,
      to_ward_code: wardCode,
      to_address: address || "123 Nguyễn Chí Thanh",
      weight: Math.max(Math.round(weight), 50), // Đảm bảo weight là số nguyên
      cod_amount: Math.round(value), // Đảm bảo cod_amount cũng là số nguyên
      from_district_id: parseInt(process.env.GHN_FROM_DISTRICT_ID) || 1444,
      from_ward_code: process.env.GHN_FROM_WARD_CODE || "20308",
    };

    console.log("GHN Calculate Fee Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
      payload,
      { headers }
    );

    if (response.data.code === 200) {
      return NextResponse.json({
        success: true,
        data: { fee: response.data.data.total || 0 },
      });
    } else {
      console.error(
        "GHN Error Response:",
        JSON.stringify(response.data, null, 2)
      );
      throw new Error(response.data.message || "GHN failed");
    }
  } catch (error) {
    console.error(
      "GHN Fee Calculation Error:",
      error.message,
      error.response?.data
    );
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
