// import { NextResponse } from "next/server";
// import crypto from "crypto";
// import moment from "moment-timezone";

// export async function POST(req) {
//   try {
//     const { amount, orderId, orderInfo, bankCode } = await req.json();

//     if (!amount || amount <= 0) {
//       throw new Error("Amount is required and must be greater than 0");
//     }
//     if (!orderId) {
//       throw new Error("Order ID is required");
//     }

//     const vnp_TmnCode = process.env.VNP_TMN_CODE;
//     const vnp_HashSecret = process.env.VNP_HASH_SECRET;
//     const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
//     const vnp_ReturnUrl =
//       process.env.VNP_RETURN_URL ||
//       "https://techtrend-vip.vercel.app/order/return";

//     if (!vnp_TmnCode || !vnp_HashSecret) {
//       throw new Error("Missing VNPAY credentials");
//     }

//     const vnp_TxnRef = orderId;
//     const vnp_Amount = Math.round(amount * 100); // VND * 100

//     let vnp_IpAddr = req.headers.get("x-forwarded-for")
//       ? req.headers.get("x-forwarded-for").split(",")[0].trim()
//       : req.socket?.remoteAddress || "127.0.0.1";
//     if (vnp_IpAddr === "::1") {
//       vnp_IpAddr = "127.0.0.1";
//     }

//     // Dùng múi giờ Asia/Ho_Chi_Minh để tránh sai lệch khi deploy
//     const now = moment().tz("Asia/Ho_Chi_Minh");
//     const expire = now.clone().add(15, "minutes");

//     const vnp_CreateDate = now.format("YYYYMMDDHHmmss");
//     const vnp_ExpireDate = expire.format("YYYYMMDDHHmmss");

//     const data = {
//       vnp_Version: "2.1.0",
//       vnp_Command: "pay",
//       vnp_TmnCode,
//       vnp_Amount,
//       vnp_CurrCode: "VND",
//       vnp_TxnRef,
//       vnp_OrderInfo: orderInfo || "Thanh toán đơn hàng từ QuickCart",
//       vnp_OrderType: "other",
//       vnp_Locale: "vn",
//       vnp_ReturnUrl,
//       vnp_IpAddr,
//       vnp_CreateDate,
//       vnp_ExpireDate,
//     };

//     if (bankCode) {
//       data.vnp_BankCode = bankCode.trim();
//     }

//     const sortedKeys = Object.keys(data).sort();

//     // Dùng encode chuẩn theo yêu cầu VNPAY (dấu cách là '+')
//     const encode = (str) => encodeURIComponent(str).replace(/%20/g, "+");

//     const signData = sortedKeys
//       .map((key) => `${encode(key)}=${encode(data[key])}`)
//       .join("&");

//     const vnp_SecureHash = crypto
//       .createHmac("sha512", vnp_HashSecret)
//       .update(signData, "utf8")
//       .digest("hex");

//     const queryString = sortedKeys
//       .map((key) => `${encode(key)}=${encode(data[key])}`)
//       .join("&");

//     const paymentUrl = `${vnp_Url}?${queryString}&vnp_SecureHash=${vnp_SecureHash}`;

//     console.log("Final payment URL:", paymentUrl);

//     return NextResponse.json({
//       success: true,
//       redirectUrl: paymentUrl,
//     });
//   } catch (error) {
//     console.error("VNPAY Error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message || "Lỗi khi tạo giao dịch VNPAY",
//       },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import crypto from "crypto";
import moment from "moment-timezone";

export async function POST(req) {
  try {
    const { amount, orderId, orderInfo, bankCode } = await req.json();

    if (!amount || amount <= 0) throw new Error("Amount must be > 0");
    if (!orderId) throw new Error("Order ID is required");

    const vnp_TmnCode = process.env.VNP_TMN_CODE;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const vnp_ReturnUrl =
      process.env.VNP_RETURN_URL ||
      "https://techtrend-vip.vercel.app/order/return";
    const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    if (!vnp_TmnCode || !vnp_HashSecret)
      throw new Error("Missing VNPAY credentials");

    const now = moment().tz("Asia/Ho_Chi_Minh");
    const vnp_CreateDate = now.format("YYYYMMDDHHmmss");
    const vnp_ExpireDate = now
      .clone()
      .add(15, "minutes")
      .format("YYYYMMDDHHmmss");

    const vnp_TxnRef = orderId;
    const vnp_Amount = Math.round(amount * 100);

    let vnp_IpAddr =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (vnp_IpAddr === "::1") vnp_IpAddr = "127.0.0.1";

    const data = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Amount,
      vnp_CurrCode: "VND",
      vnp_TxnRef,
      vnp_OrderInfo: orderInfo || "Thanh toán đơn hàng từ QuickCart",
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl,
      vnp_IpAddr,
      vnp_CreateDate,
      vnp_ExpireDate,
    };

    if (bankCode) data.vnp_BankCode = bankCode.trim();

    const sortedKeys = Object.keys(data).sort();

    // VNPAY dùng encode kiểu: dấu cách thành +
    const encode = (str) => encodeURIComponent(str).replace(/%20/g, "+");

    const signData = sortedKeys
      .map((key) => `${encode(key)}=${encode(data[key])}`)
      .join("&");

    const vnp_SecureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData, "utf8")
      .digest("hex");

    const queryString = sortedKeys
      .map((key) => `${encode(key)}=${encode(data[key])}`)
      .join("&");

    const paymentUrl = `${vnp_Url}?${queryString}&vnp_SecureHash=${vnp_SecureHash}`;

    console.log("🔗 Final Redirect URL:", paymentUrl);
    console.log("🧾 Raw Sign Data:", signData);
    console.log("🔒 Generated Hash:", vnp_SecureHash);

    return NextResponse.json({
      success: true,
      redirectUrl: paymentUrl,
    });
  } catch (error) {
    console.error("VNPAY Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
