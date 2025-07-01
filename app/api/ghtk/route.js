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

// import { NextResponse } from "next/server";
// import axios from "axios";

// const GHTK_API_URL =
//   process.env.GHTK_API_URL || "https://services.giaohangtietkiem.vn";
// const GHTK_API_TOKEN =
//   process.env.GHTK_API_TOKEN || "1ZB8bG2GkwWhUlD2o5OeveavkdmDxg3OyalVGba";

// // Hàm gọi GHTK API
// const callGhtkApi = async (endpoint, method, data) => {
//   try {
//     const url = `${GHTK_API_URL}${endpoint}`;
//     console.log("✅ Calling GHTK API:", url);
//     console.log("📤 GHTK Request Data:", JSON.stringify(data, null, 2));

//     const response = await axios({
//       method,
//       url,
//       headers: {
//         Token: GHTK_API_TOKEN,
//         "Content-Type": "application/json",
//       },
//       data: method === "POST" ? data : undefined,
//       params: method === "GET" ? data : undefined,
//     });

//     console.log("📥 GHTK Response:", JSON.stringify(response.data, null, 2));
//     return response.data;
//   } catch (error) {
//     console.error("❌ GHTK API Error:", error.response?.data || error.message);
//     throw new Error(error.response?.data?.message || "GHTK API request failed");
//   }
// };

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { action, payload } = body;

//     let endpoint = "";
//     let method = "GET";
//     let data = {};

//     switch (action) {
//       case "createOrder":
//         endpoint = "/services/shipment/order";
//         method = "POST";
//         data = payload;

//         const createRes = await callGhtkApi(endpoint, method, data);
//         if (createRes.success) {
//           return NextResponse.json({
//             success: true,
//             data: createRes,
//             message: "Tạo đơn hàng thành công",
//           });
//         } else {
//           return NextResponse.json(
//             {
//               success: false,
//               message: createRes.message || "Tạo đơn thất bại",
//             },
//             { status: 400 }
//           );
//         }

//       case "calculateFee":
//         endpoint = "/services/shipment/fee";
//         method = "POST";
//         data = payload;

//         const feeRes = await callGhtkApi(endpoint, method, data);
//         if (feeRes.success && feeRes.fee) {
//           return NextResponse.json({
//             success: true,
//             data: feeRes,
//             message: "Tính phí thành công",
//           });
//         } else {
//           return NextResponse.json(
//             {
//               success: false,
//               message: feeRes.message || "Tính phí thất bại",
//             },
//             { status: 400 }
//           );
//         }

//       case "trackOrder":
//         if (!payload.trackingCode || typeof payload.trackingCode !== "string") {
//           return NextResponse.json(
//             { success: false, message: "Thiếu mã trackingCode" },
//             { status: 400 }
//           );
//         }
//         endpoint = `/services/shipment/v2/${payload.trackingCode}`;
//         method = "GET";
//         break;

//       case "cancelOrder":
//         if (!payload.trackingCode || typeof payload.trackingCode !== "string") {
//           return NextResponse.json(
//             { success: false, message: "Thiếu mã trackingCode" },
//             { status: 400 }
//           );
//         }
//         endpoint = `/services/shipment/cancel/${payload.trackingCode}`;
//         method = "GET";
//         break;

//       case "getAddress":
//         endpoint = "/services/address/list";
//         method = "GET";
//         break;

//       default:
//         return NextResponse.json(
//           { success: false, message: "Hành động không hợp lệ" },
//           { status: 400 }
//         );
//     }

//     const result = await callGhtkApi(endpoint, method, data);

//     if (action === "getAddress") {
//       const provinces = result.province || [];
//       const districts = result.district || [];
//       const wards = result.ward || [];

//       const processed = provinces.map((prov) => {
//         const provDistricts = districts.filter(
//           (d) => d.province_id === prov.province_id
//         );
//         return {
//           name: prov.province_name,
//           districts: provDistricts.map((dist) => {
//             const distWards = wards.filter(
//               (w) => w.district_id === dist.district_id
//             );
//             return {
//               name: dist.district_name,
//               wards: distWards.map((w) => ({ name: w.ward_name })),
//             };
//           }),
//         };
//       });

//       return NextResponse.json({ success: true, data: processed });
//     }

//     return NextResponse.json({ success: true, data: result });
//   } catch (error) {
//     console.error("❌ GHTK Error:", error.message);
//     return NextResponse.json(
//       { success: false, message: `Lỗi: ${error.message}` },
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

// Validate GHTK payload
const validateCreateOrderPayload = (payload) => {
  const required = [
    "id",
    "pick_name",
    "pick_address",
    "pick_province",
    "pick_district",
    "pick_ward",
    "pick_tel",
    "name",
    "address",
    "province",
    "district",
    "ward",
    "tel",
    "value",
    "weight",
  ];

  for (const field of required) {
    if (!payload[field]) {
      return { valid: false, message: `Thiếu trường bắt buộc: ${field}` };
    }
  }

  // Validate weight (GHTK requires minimum 50g)
  if (payload.weight < 50) {
    return { valid: false, message: "Trọng lượng tối thiểu là 50g" };
  }

  // Validate value range for service types
  if (payload.service_type_id === 2) {
    // Express
    if (payload.value < 1 || payload.value > 20000000) {
      return {
        valid: false,
        message: "Dịch vụ EXPRESS yêu cầu giá trị từ 1đ đến 20,000,000đ",
      };
    }
  }

  // Validate products array
  if (payload.products && Array.isArray(payload.products)) {
    for (const product of payload.products) {
      if (!product.name || !product.weight || !product.quantity) {
        return {
          valid: false,
          message: "Sản phẩm phải có đầy đủ: name, weight, quantity",
        };
      }
      if (product.weight < 50) {
        return {
          valid: false,
          message: `Sản phẩm "${product.name}" có trọng lượng < 50g`,
        };
      }
    }
  }

  return { valid: true };
};

// Hàm gọi GHTK API với retry mechanism
const callGhtkApi = async (endpoint, method, data, retries = 2) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `${GHTK_API_URL}${endpoint}`;
      console.log(`✅ GHTK API Call (Attempt ${attempt}):`, url);
      console.log("📤 GHTK Request Data:", JSON.stringify(data, null, 2));

      const config = {
        method,
        url,
        headers: {
          Token: GHTK_API_TOKEN,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      };

      if (method === "POST") {
        config.data = data;
      } else if (method === "GET" && data) {
        config.params = data;
      }

      const response = await axios(config);

      console.log("📥 GHTK Response:", JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error(`❌ GHTK API Error (Attempt ${attempt}):`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // Nếu là lần thử cuối cùng hoặc lỗi không thể retry
      if (attempt === retries || error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "GHTK API request failed";
        throw new Error(errorMessage);
      }

      // Đợi trước khi retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Normalize address data for GHTK
const normalizeAddressData = (address) => {
  return {
    province: address.province?.trim() || address.city?.trim() || "",
    district: address.district?.trim() || address.state?.trim() || "",
    ward: address.ward?.trim() || "",
    address: address.address?.trim() || address.area?.trim() || "",
  };
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, message: "Thiếu tham số action" },
        { status: 400 }
      );
    }

    let endpoint = "";
    let method = "GET";
    let data = {};

    switch (action) {
      case "createOrder":
        if (!payload) {
          return NextResponse.json(
            { success: false, message: "Thiếu payload cho createOrder" },
            { status: 400 }
          );
        }

        // Validate payload
        const validation = validateCreateOrderPayload(payload);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, message: validation.message },
            { status: 400 }
          );
        }

        endpoint = "/services/shipment/order";
        method = "POST";
        data = {
          ...payload,
          // Ensure minimum weight
          weight: Math.max(payload.weight, 50),
          products:
            payload.products?.map((product) => ({
              ...product,
              weight: Math.max(product.weight, 50),
            })) || [],
        };

        const createRes = await callGhtkApi(endpoint, method, data);
        if (createRes.success) {
          return NextResponse.json({
            success: true,
            data: createRes,
            message: "Tạo đơn hàng GHTK thành công",
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              message: createRes.message || "Tạo đơn GHTK thất bại",
              error: createRes,
            },
            { status: 400 }
          );
        }

      case "calculateFee":
        if (!payload) {
          return NextResponse.json(
            { success: false, message: "Thiếu payload cho calculateFee" },
            { status: 400 }
          );
        }

        endpoint = "/services/shipment/fee";
        method = "POST";
        data = {
          ...payload,
          weight: Math.max(payload.weight || 50, 50), // Ensure minimum 50g
        };

        const feeRes = await callGhtkApi(endpoint, method, data);
        if (feeRes.success && feeRes.fee) {
          return NextResponse.json({
            success: true,
            data: feeRes,
            message: "Tính phí giao hàng thành công",
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              message: feeRes.message || "Tính phí thất bại",
              error: feeRes,
            },
            { status: 400 }
          );
        }

      case "trackOrder":
        if (
          !payload?.trackingCode ||
          typeof payload.trackingCode !== "string"
        ) {
          return NextResponse.json(
            { success: false, message: "Thiếu mã trackingCode hợp lệ" },
            { status: 400 }
          );
        }
        endpoint = `/services/shipment/v2/${payload.trackingCode}`;
        method = "GET";
        break;

      case "cancelOrder":
        if (
          !payload?.trackingCode ||
          typeof payload.trackingCode !== "string"
        ) {
          return NextResponse.json(
            { success: false, message: "Thiếu mã trackingCode hợp lệ" },
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

      case "getOrderStatus":
        if (!payload?.trackingCode) {
          return NextResponse.json(
            { success: false, message: "Thiếu mã trackingCode" },
            { status: 400 }
          );
        }
        endpoint = `/services/shipment/v2/${payload.trackingCode}`;
        method = "GET";
        break;

      case "printLabel":
        if (!payload?.trackingCode) {
          return NextResponse.json(
            { success: false, message: "Thiếu mã trackingCode" },
            { status: 400 }
          );
        }
        endpoint = `/services/label/${payload.trackingCode}`;
        method = "GET";
        break;

      default:
        return NextResponse.json(
          { success: false, message: `Hành động không hợp lệ: ${action}` },
          { status: 400 }
        );
    }

    const result = await callGhtkApi(endpoint, method, data);

    // Special handling for address data
    if (action === "getAddress") {
      const provinces = result.province || [];
      const districts = result.district || [];
      const wards = result.ward || [];

      const processed = provinces.map((prov) => {
        const provDistricts = districts.filter(
          (d) => d.province_id === prov.province_id
        );
        return {
          id: prov.province_id,
          name: prov.province_name,
          districts: provDistricts.map((dist) => {
            const distWards = wards.filter(
              (w) => w.district_id === dist.district_id
            );
            return {
              id: dist.district_id,
              name: dist.district_name,
              wards: distWards.map((w) => ({
                id: w.ward_id,
                name: w.ward_name,
              })),
            };
          }),
        };
      });

      return NextResponse.json({
        success: true,
        data: processed,
        message: "Lấy danh sách địa chỉ thành công",
      });
    }

    // Special handling for tracking
    if (action === "trackOrder" || action === "getOrderStatus") {
      return NextResponse.json({
        success: true,
        data: result,
        message: result.success
          ? "Lấy thông tin đơn hàng thành công"
          : "Không tìm thấy đơn hàng",
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: "Thực hiện thành công",
    });
  } catch (error) {
    console.error("❌ GHTK API Error:", error.message);

    // Parse error message if it's JSON
    let errorMessage = error.message;
    try {
      const parsedError = JSON.parse(error.message);
      errorMessage = parsedError.message || parsedError.error || error.message;
    } catch {
      // Keep original error message
    }

    return NextResponse.json(
      {
        success: false,
        message: `Lỗi GHTK: ${errorMessage}`,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
