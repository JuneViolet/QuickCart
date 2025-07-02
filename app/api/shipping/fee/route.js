// import { NextResponse } from "next/server";
// import axios from "axios";

// export async function POST(request) {
//   try {
//     const { districtId, wardCode, address, weight, value } =
//       await request.json();

//     if (!districtId || !wardCode || !weight || !value) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const headers = {
//       "Content-Type": "application/json",
//       Token: process.env.GHN_TOKEN,
//       ShopId: process.env.GHN_SHOP_ID,
//     };

//     const payload = {
//       service_type_id: 2, // Express
//       to_district_id: districtId,
//       to_ward_code: wardCode,
//       to_address: address || "123 Nguyễn Chí Thanh",
//       weight: Math.max(weight, 50),
//       cod_amount: value,
//       from_district_id: 1444, // Thay bằng mã quận xuất phát thực tế
//       from_ward_code: "20308", // Thay bằng mã phường xuất phát thực tế
//     };

//     console.log("GHN Calculate Fee Payload:", payload);

//     const response = await axios.post(
//       "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
//       payload,
//       { headers }
//     );

//     if (response.data.code === 200) {
//       return NextResponse.json({
//         success: true,
//         data: { fee: response.data.data.total || 0 },
//       });
//     } else {
//       throw new Error(response.data.message || "GHN failed");
//     }
//   } catch (error) {
//     console.error("GHN Fee Calculation Error:", error);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const { districtId, wardCode, address, weight, value } =
      await request.json();

    if (!districtId || !wardCode || !weight || !value) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const headers = {
      "Content-Type": "application/json",
      Token: process.env.GHN_TOKEN,
      ShopId: process.env.GHN_SHOP_ID,
    };

    console.log("Received districtId:", typeof districtId, districtId);
    const payload = {
      service_type_id: 2,
      to_district_id: parseInt(districtId), // Đảm bảo là số nguyên
      to_ward_code: wardCode,
      to_address: address || "123 Nguyễn Chí Thanh",
      weight: Math.max(weight, 50),
      cod_amount: value,
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
