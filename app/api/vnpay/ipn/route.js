// import { NextResponse } from "next/server";
// import crypto from "crypto";

// // VNPAY IPN luôn gửi bằng GET (query string), nên ta dùng request.url để lấy
// export async function GET(req) {
//   try {
//     const url = new URL(req.url);
//     const params = Object.fromEntries(url.searchParams.entries());

//     const vnp_HashSecret = process.env.VNP_HASH_SECRET;
//     const vnp_SecureHash = params.vnp_SecureHash;
//     delete params.vnp_SecureHash;

//     // Sắp xếp & tạo chuỗi hash data
//     const sortedKeys = Object.keys(params).sort();
//     const signData = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");

//     const secureHash = crypto
//       .createHmac("sha512", vnp_HashSecret)
//       .update(signData, "utf8")
//       .digest("hex");

//     if (secureHash === vnp_SecureHash && params.vnp_ResponseCode === "00") {
//       // TODO: cập nhật trạng thái đơn hàng trong DB nếu cần
//       console.log("IPN hợp lệ:", {
//         orderId: params.vnp_TxnRef,
//         amount: params.vnp_Amount,
//         transactionNo: params.vnp_TransactionNo,
//       });

//       return NextResponse.json({ RspCode: "00", Message: "Success" });
//     } else {
//       console.error("IPN không hợp lệ hoặc thanh toán thất bại:", {
//         responseCode: params.vnp_ResponseCode,
//         secureHash,
//         vnp_SecureHash,
//       });
//       return NextResponse.json(
//         { RspCode: "97", Message: "Invalid Signature or Failed" },
//         { status: 400 }
//       );
//     }
//   } catch (error) {
//     console.error("IPN Error:", error);
//     return NextResponse.json(
//       { RspCode: "99", Message: "Unknown error" },
//       { status: 500 }
//     );
//   }
// }
// app/api/vnpay/ipn/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import crypto from "crypto";

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const receivedSecureHash = params.vnp_SecureHash;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET?.trim();

    // 🔍 Debug thông tin IPN nhận được
    console.log("🌐 IPN Request URL:", req.url);
    console.log("📥 Raw VNPAY Params:", JSON.stringify(params, null, 2));
    console.log("🔑 ENV HASH SECRET:", JSON.stringify(vnp_HashSecret));

    // 1. Xóa các trường không dùng để ký
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    // 2. Sắp xếp theo thứ tự key tăng dần
    const sortedKeys = Object.keys(params).sort();

    // 3. Hàm encode đúng chuẩn VNPAY (space => +)
    const encode = (str) => encodeURIComponent(str).replace(/%20/g, "+");

    // 4. Tạo signData với encode đúng
    const signData = sortedKeys
      .map((key) => `${encode(key)}=${encode(params[key])}`)
      .join("&");

    // 5. Tạo hash SHA512
    const generatedSecureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData, "utf8")
      .digest("hex");

    // 🔍 Log so sánh hash
    console.log("🔑 Sorted Keys:", sortedKeys);
    console.log("🧾 Sign Data:", signData);
    console.log("📨 Received Hash:", receivedSecureHash);
    console.log("✅ Generated Hash:", generatedSecureHash);

    // 6. So sánh hash
    if (
      receivedSecureHash?.toLowerCase() !== generatedSecureHash.toLowerCase()
    ) {
      console.warn("❌ Hash mismatch. Check failed.");
      return NextResponse.json({ RspCode: "97", Message: "Invalid Checksum" });
    }

    // 7. Lấy dữ liệu đơn hàng
    const { vnp_TxnRef, vnp_Amount, vnp_ResponseCode, vnp_TransactionNo } =
      params;

    const order = await Order.findOne({ trackingCode: vnp_TxnRef });

    if (!order) {
      console.warn(`⚠️ Order not found: ${vnp_TxnRef}`);
      return NextResponse.json({ RspCode: "01", Message: "Order Not Found" });
    }

    if (order.status === "paid") {
      console.log(`ℹ️ Order already confirmed: ${vnp_TxnRef}`);
      return NextResponse.json({
        RspCode: "02",
        Message: "Order already confirmed",
      });
    }

    const expectedAmount = order.amount * 100;
    if (parseInt(vnp_Amount) !== expectedAmount) {
      console.warn(
        `❗ Invalid amount: Expected ${expectedAmount}, got ${vnp_Amount}`
      );
      return NextResponse.json({ RspCode: "04", Message: "Invalid amount" });
    }

    if (vnp_ResponseCode === "00") {
      order.status = "paid";
      order.vnp_TransactionNo = vnp_TransactionNo;
      await order.save();
      console.log(`✅ Payment confirmed for: ${vnp_TxnRef}`);
      return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      order.status = "failed";
      await order.save();
      console.warn(`❌ Payment failed for: ${vnp_TxnRef}`);
      return NextResponse.json({
        RspCode: "00",
        Message: "Transaction Failed Recorded",
      });
    }
  } catch (err) {
    console.error("💥 IPN Exception:", err);
    return NextResponse.json(
      { RspCode: "99", Message: `Exception: ${err.message}` },
      { status: 500 }
    );
  }
}
