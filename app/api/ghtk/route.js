// // api/ghtk/route.js
// import { NextResponse } from "next/server";
// import axios from "axios";

// const GHTK_API_URL =
//   process.env.GHTK_API_URL || "https://services.giaohangtietkiem.vn";
// const GHTK_API_TOKEN =
//   process.env.GHTK_API_TOKEN || "1ZB8bG2GkwWhUlD2o5OeveavkdmDxg3OyalVGba";

// const callGhtkApi = async (endpoint, method, data) => {
//   try {
//     console.log("Calling GHTK API with token:", GHTK_API_TOKEN);
//     const response = await axios({
//       method,
//       url: `${GHTK_API_URL}${endpoint}`,
//       headers: {
//         Token: GHTK_API_TOKEN,
//         "Content-Type": "application/json",
//       },
//       data: method === "POST" ? data : undefined,
//       params: method === "GET" ? data : undefined,
//     });
//     console.log(
//       "Raw GHTK API Response:",
//       JSON.stringify(response.data, null, 2)
//     );
//     return response.data;
//   } catch (error) {
//     console.error(
//       `GHTK API Error (${endpoint}):`,
//       JSON.stringify(error.response?.data, null, 2) || error.message
//     );
//     throw new Error(error.response?.data?.message || "GHTK API request failed");
//   }
// };

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { action, payload } = body;

//     let endpoint, method, data;
//     switch (action) {
//       case "createOrder":
//         endpoint = "/services/shipment/order";
//         method = "POST";
//         data = payload;
//         break;
//       case "calculateFee":
//         endpoint = "/services/shipment/fee";
//         method = "POST";
//         data = payload;
//         break;
//       case "trackOrder":
//         endpoint = `/services/shipment/v2/${payload.trackingCode}`;
//         method = "GET";
//         data = {};
//         break;
//       case "cancelOrder":
//         endpoint = `/services/shipment/cancel/${payload.trackingCode}`;
//         method = "GET";
//         data = {};
//         break;
//       case "getAddress":
//         endpoint = "/services/address/list";
//         method = "GET";
//         data = {};
//         break;
//       default:
//         return NextResponse.json(
//           { success: false, message: "Invalid action" },
//           { status: 400 }
//         );
//     }

//     const result = await callGhtkApi(endpoint, method, data);

//     if (action === "getAddress") {
//       const provinces = result.province || [];
//       const districts = result.district || [];
//       const wards = result.ward || [];

//       const processedProvinces = provinces.map((prov) => {
//         const provDistricts = districts.filter(
//           (dist) => dist.province_id === prov.province_id
//         );
//         return {
//           name: prov.province_name,
//           districts: provDistricts.map((dist) => {
//             const distWards = wards.filter(
//               (ward) => ward.district_id === dist.district_id
//             );
//             return {
//               name: dist.district_name,
//               wards: distWards.map((ward) => ({ name: ward.ward_name })),
//             };
//           }),
//         };
//       });

//       console.log("Processed Provinces:", processedProvinces);
//       return NextResponse.json({ success: true, data: processedProvinces });
//     }

//     if (action === "calculateFee") {
//       if (result.success && result.fee) {
//         return NextResponse.json({
//           success: true,
//           data: { success: true, fee: result.fee, message: result.message },
//         });
//       } else {
//         return NextResponse.json({
//           success: true,
//           data: { success: false, message: result.message || "GHTK error" },
//         });
//       }
//     }

//     return NextResponse.json({ success: true, data: result });
//   } catch (error) {
//     console.error("GHTK Error:", error.message);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
// /api/ghtk

import { NextResponse } from "next/server";
import axios from "axios";

const GHTK_API_URL =
  process.env.GHTK_API_URL || "https://services.giaohangtietkiem.vn";
const GHTK_API_TOKEN =
  process.env.GHTK_API_TOKEN || "1ZB8bG2GkwWhUlD2o5OeveavkdmDxg3OyalVGba";

// Hàm gọi GHTK API
const callGhtkApi = async (endpoint, method, data) => {
  try {
    const url = `${GHTK_API_URL}${endpoint}`;
    console.log("✅ Calling GHTK API:", url);
    console.log("📤 GHTK Request Data:", JSON.stringify(data, null, 2));

    const response = await axios({
      method,
      url,
      headers: {
        Token: GHTK_API_TOKEN,
        "Content-Type": "application/json",
      },
      data: method === "POST" ? data : undefined,
      params: method === "GET" ? data : undefined,
    });

    console.log("📥 GHTK Response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ GHTK API Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "GHTK API request failed");
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    let endpoint = "";
    let method = "GET";
    let data = {};

    switch (action) {
      case "createOrder":
        endpoint = "/services/shipment/order";
        method = "POST";
        data = payload;

        const createRes = await callGhtkApi(endpoint, method, data);
        if (createRes.success) {
          return NextResponse.json({
            success: true,
            data: createRes,
            message: "Tạo đơn hàng thành công",
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              message: createRes.message || "Tạo đơn thất bại",
            },
            { status: 400 }
          );
        }

      case "calculateFee":
        endpoint = "/services/shipment/fee";
        method = "POST";
        data = payload;

        const feeRes = await callGhtkApi(endpoint, method, data);
        if (feeRes.success && feeRes.fee) {
          return NextResponse.json({
            success: true,
            data: feeRes,
            message: "Tính phí thành công",
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              message: feeRes.message || "Tính phí thất bại",
            },
            { status: 400 }
          );
        }

      case "trackOrder":
        if (!payload.trackingCode || typeof payload.trackingCode !== "string") {
          return NextResponse.json(
            { success: false, message: "Thiếu mã trackingCode" },
            { status: 400 }
          );
        }
        endpoint = `/services/shipment/v2/${payload.trackingCode}`;
        method = "GET";
        break;

      case "cancelOrder":
        if (!payload.trackingCode || typeof payload.trackingCode !== "string") {
          return NextResponse.json(
            { success: false, message: "Thiếu mã trackingCode" },
            { status: 400 }
          );
        }
        endpoint = `/services/shipment/cancel/${payload.trackingCode}`;
        method = "GET";
        break;

      case "getAddress":
        endpoint = "/services/address/list";
        method = "GET";
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Hành động không hợp lệ" },
          { status: 400 }
        );
    }

    const result = await callGhtkApi(endpoint, method, data);

    if (action === "getAddress") {
      const provinces = result.province || [];
      const districts = result.district || [];
      const wards = result.ward || [];

      const processed = provinces.map((prov) => {
        const provDistricts = districts.filter(
          (d) => d.province_id === prov.province_id
        );
        return {
          name: prov.province_name,
          districts: provDistricts.map((dist) => {
            const distWards = wards.filter(
              (w) => w.district_id === dist.district_id
            );
            return {
              name: dist.district_name,
              wards: distWards.map((w) => ({ name: w.ward_name })),
            };
          }),
        };
      });

      return NextResponse.json({ success: true, data: processed });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ GHTK Error:", error.message);
    return NextResponse.json(
      { success: false, message: `Lỗi: ${error.message}` },
      { status: 500 }
    );
  }
}
