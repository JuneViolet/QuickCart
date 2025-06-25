// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     const { amount, orderId, orderInfo, bankCode } = await req.json();

//     const vnp_TmnCode = process.env.VNP_TMN_CODE; // OLNDPX0M
//     const vnp_HashSecret = process.env.VNP_HASH_SECRET; // SHJDW11ZBY6OZVHSUJSVUEESNL5ENCGN
//     const vnp_Url =
//       process.env.VNP_URL ||
//       "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
//     const vnp_ReturnUrl =
//       process.env.VNP_RETURN_URL || "http://localhost:3000/order/return";

//     console.log("Request Data:", { amount, orderId, orderInfo, bankCode });
//     console.log("VNP_HASH_SECRET from env:", vnp_HashSecret);

//     const vnp_TxnRef = orderId;
//     const vnp_OrderInfo = orderInfo || "Thanh toan don hang tu QuickCart";
//     const vnp_Amount = Math.round(amount * 100); // Đảm bảo là số nguyên
//     const vnp_IpAddr = req.headers.get("x-forwarded-for") || "127.0.0.1";
//     const vnp_CreateDate = new Date()
//       .toISOString()
//       .slice(0, 19)
//       .replace("T", " ");

//     const data = {
//       vnp_Version: "2.1.0",
//       vnp_Command: "pay",
//       vnp_TmnCode,
//       vnp_Amount,
//       vnp_CurrCode: "VND",
//       vnp_TxnRef,
//       vnp_OrderInfo,
//       vnp_OrderType: "other",
//       vnp_Locale: "vn",
//       vnp_ReturnUrl,
//       vnp_IpAddr,
//       vnp_CreateDate,
//       vnp_BankCode: bankCode || "",
//     };

//     // Tạo signData theo đúng quy trình VNPAY
//     let signData = Object.keys(data)
//       .filter(
//         (key) =>
//           key !== "vnp_SecureHash" &&
//           data[key] !== undefined &&
//           data[key] !== ""
//       )
//       .sort()
//       .map((key) => {
//         const encodedValue = encodeURIComponent(data[key]).replace(/%20/g, "+");
//         console.log(`Key: ${key}, Encoded Value: ${encodedValue}`); // Debug từng tham số
//         return `${key}=${encodedValue}`;
//       })
//       .join("&");
//     console.log("Sign Data:", signData);

//     const crypto = require("crypto");
//     const secureHash = crypto
//       .createHash("sha256")
//       .update(signData + vnp_HashSecret)
//       .digest("hex");
//     console.log("Calculated SecureHash:", secureHash);

//     data.vnp_SecureHash = secureHash;

//     const response = await fetch(vnp_Url, {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams(data).toString(),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to connect to VNPAY: ${response.statusText}`);
//     }

//     const redirectUrl = response.url;
//     console.log("Redirect URL from VNPAY:", redirectUrl);
//     return new NextResponse(null, {
//       status: 302,
//       headers: { Location: redirectUrl },
//     });
//   } catch (error) {
//     console.error("VNPAY Error:", error);
//     return new NextResponse(
//       JSON.stringify({ error: "Lỗi khi tạo giao dịch VNPAY" }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { amount, orderId, orderInfo, bankCode } = await req.json();

    const vnp_TmnCode = process.env.VNP_TMN_CODE; // OLNDPX0M
    const vnp_HashSecret = process.env.VNP_HASH_SECRET; // SHJDW11ZBY6OZVHSUJSVUEESNL5ENCGN
    const vnp_Url =
      process.env.VNP_URL ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const vnp_ReturnUrl =
      process.env.VNP_RETURN_URL ||
      "https://techtrend-vip.vercel.app/order/return";

    const vnp_TxnRef = orderId;
    const vnp_Amount = Math.round(amount); // Sử dụng amount trực tiếp
    const vnp_IpAddr = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const now = new Date();
    const vnp_CreateDate = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
    const vnp_ExpireDate = new Date(now.getTime() + 60 * 60 * 1000) // 60 phút
      .toISOString()
      .replace(/[-:]/g, "")
      .replace("T", "")
      .slice(0, 14);

    console.log("Server Time:", new Date().toISOString());

    const data = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Amount,
      vnp_CurrCode: "VND",
      vnp_TxnRef,
      vnp_OrderInfo: orderInfo || "Thanh toan don hang tu QuickCart",
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl,
      vnp_IpAddr,
      vnp_CreateDate,
      vnp_ExpireDate,
      vnp_BankCode: bankCode || "",
    };

    // Sắp xếp và tạo query string
    const sortedKeys = Object.keys(data)
      .filter((key) => data[key] !== undefined && data[key] !== "")
      .sort();
    let query = sortedKeys
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
      )
      .join("&");
    console.log("Query String:", query);

    // Tạo vnp_SecureHash (HMAC-SHA512)
    let hashData = sortedKeys
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
      )
      .join("&");
    const vnp_SecureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(hashData)
      .digest("hex");
    console.log("Calculated SecureHash:", vnp_SecureHash);

    // Tạo URL hoàn chỉnh và trả về cho client
    const vnp_UrlFinal = `${vnp_Url}?${query}&vnp_SecureHash=${vnp_SecureHash}`;
    console.log("Final VNPAY URL:", vnp_UrlFinal);

    return NextResponse.json(
      { success: true, redirectUrl: vnp_UrlFinal },
      { status: 200 }
    );
  } catch (error) {
    console.error("VNPAY Error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi tạo giao dịch VNPAY" },
      { status: 500 }
    );
  }
}
