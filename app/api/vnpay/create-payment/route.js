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

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error("Amount is required and must be greater than 0");
    }
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const vnp_TmnCode = process.env.VNP_TMN_CODE;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const vnp_ReturnUrl =
      process.env.VNP_RETURN_URL ||
      "https://techtrend-vip.vercel.app/order/return";

    // Validate environment variables
    if (!vnp_TmnCode || !vnp_HashSecret) {
      throw new Error("Missing VNPAY credentials");
    }

    const vnp_TxnRef = orderId;
    const vnp_Amount = Math.round(amount * 100); // Convert to VND cents (multiply by 100)
    const vnp_IpAddr = req.headers.get("x-forwarded-for")
      ? req.headers.get("x-forwarded-for").split(",")[0].trim()
      : req.socket.remoteAddress || "127.0.0.1";
    // Format dates
    const now = new Date();
    const vnp_CreateDate =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0") +
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0") +
      now.getSeconds().toString().padStart(2, "0");
    const expireTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 phút
    const vnp_ExpireDate =
      expireTime.getFullYear().toString() +
      (expireTime.getMonth() + 1).toString().padStart(2, "0") +
      expireTime.getDate().toString().padStart(2, "0") +
      expireTime.getHours().toString().padStart(2, "0") +
      expireTime.getMinutes().toString().padStart(2, "0") +
      expireTime.getSeconds().toString().padStart(2, "0");
    console.log("Server Time:", new Date().toISOString());
    console.log("Payment details:", {
      vnp_TmnCode,
      vnp_Amount,
      vnp_TxnRef,
      vnp_IpAddr,
      vnp_CreateDate,
      vnp_ExpireDate,
    });

    // Prepare data object
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
      vnp_BankCode: bankCode ? bankCode.trim() : "",
    };

    // Sort keys and create signature data (WITH ENCODING for signature)
    const sortedKeys = Object.keys(data)
      .filter((key) => data[key] !== undefined && data[key] !== "")
      .sort();
    const signData = sortedKeys
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
      )
      .join("&");
    console.log("Sign data (raw):", signData);

    // Create signature
    const vnp_SecureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData, "utf8")
      .digest("hex");
    console.log("Generated hash:", vnp_SecureHash);

    // Create query string (WITH ENCODING for URL)
    const queryString = sortedKeys
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
      )
      .join("&");

    // Build final URL
    const paymentUrl = `${vnp_Url}?${queryString}&vnp_SecureHash=${vnp_SecureHash}`;
    console.log("Final payment URL:", paymentUrl);

    return NextResponse.json({
      success: true,
      redirectUrl: paymentUrl,
    });
  } catch (error) {
    console.error("VNPAY Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi khi tạo giao dịch VNPAY",
      },
      { status: 500 }
    );
  }
}
