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
// Khôi phục phiên bản ban đầu của bạn, thêm log
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import crypto from "crypto";
import axios from "axios";

export async function GET(req) {
  await connectDB();

  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    console.log("🌐 IPN Request Params:", JSON.stringify(params, null, 2));

    const receivedSecureHash = params.vnp_SecureHash;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET?.trim();

    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sortedKeys = Object.keys(params).sort();
    const signData = sortedKeys
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");
    const generatedSecureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData)
      .digest("hex");

    console.log("🔑 Generated SecureHash:", generatedSecureHash);
    console.log("📨 Received SecureHash:", receivedSecureHash);

    if (receivedSecureHash !== generatedSecureHash) {
      console.warn("❌ Hash mismatch");
      return NextResponse.json({ RspCode: "97", Message: "Invalid Checksum" });
    }

    const { vnp_TxnRef, vnp_ResponseCode } = params;
    const order = await Order.findOne({ trackingCode: vnp_TxnRef });

    if (!order) {
      console.warn("⚠️ Order not found:", vnp_TxnRef);
      return NextResponse.json({ RspCode: "01", Message: "Order Not Found" });
    }

    if (order.status === "paid") {
      console.log("ℹ️ Order already paid:", vnp_TxnRef);
      return NextResponse.json({
        RspCode: "02",
        Message: "Order already confirmed",
      });
    }

    if (vnp_ResponseCode === "00") {
      order.status = "paid";
      await order.save();
      console.log("✅ Payment confirmed for:", vnp_TxnRef);

      // Gọi GHN (thêm logic GHN nếu cần)
      return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      order.status = "failed";
      await order.save();
      console.log("❌ Payment failed for:", vnp_TxnRef);
      return NextResponse.json({
        RspCode: "00",
        Message: "Transaction Failed Recorded",
      });
    }
  } catch (error) {
    console.error("💥 IPN Error:", error);
    return NextResponse.json(
      { RspCode: "99", Message: `Exception: ${error.message}` },
      { status: 500 }
    );
  }
}
