import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { amount, orderId, orderInfo, bankCode } = await req.json();

    const vnp_TmnCode = process.env.VNP_TMN_CODE; // OLNDPX0M
    const vnp_HashSecret = process.env.VNP_HASH_SECRET; // SHJDW11ZBY6OZVHSUJSVUEESNL5ENCGN
    const vnp_Url =
      process.env.VNP_URL ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const vnp_ReturnUrl =
      process.env.VNP_RETURN_URL || "http://localhost:3000/order/return";

    console.log("Request Data:", { amount, orderId, orderInfo, bankCode });

    const vnp_TxnRef = orderId;
    const vnp_OrderInfo = orderInfo || "Thanh toan don hang tu QuickCart";
    const vnp_Amount = Math.round(amount * 100); // Đảm bảo là số nguyên
    const vnp_IpAddr = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const vnp_CreateDate = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const data = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Amount,
      vnp_CurrCode: "VND",
      vnp_TxnRef,
      vnp_OrderInfo,
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl,
      vnp_IpAddr,
      vnp_CreateDate,
      vnp_BankCode: bankCode || "",
    };

    // Tạo signData đúng theo yêu cầu VNPAY
    let signData = Object.keys(data)
      .filter(
        (key) =>
          key !== "vnp_SecureHash" &&
          data[key] !== undefined &&
          data[key] !== ""
      )
      .sort()
      .map(
        (key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`
      )
      .join("&");
    console.log("Sign Data:", signData);

    const crypto = require("crypto");
    const secureHash = crypto
      .createHash("sha256")
      .update(signData + vnp_HashSecret)
      .digest("hex");
    console.log("Calculated SecureHash:", secureHash);

    data.vnp_SecureHash = secureHash;

    const response = await fetch(vnp_Url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data).toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to connect to VNPAY: ${response.statusText}`);
    }

    const redirectUrl = response.url;
    console.log("Redirect URL from VNPAY:", redirectUrl);
    return new NextResponse(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });
  } catch (error) {
    console.error("VNPAY Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Lỗi khi tạo giao dịch VNPAY" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
