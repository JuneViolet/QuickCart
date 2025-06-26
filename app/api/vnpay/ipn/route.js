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
//       console.log("✅ IPN hợp lệ:", {
//         orderId: params.vnp_TxnRef,
//         amount: params.vnp_Amount,
//         transactionNo: params.vnp_TransactionNo,
//       });

//       return NextResponse.json({ RspCode: "00", Message: "Success" });
//     } else {
//       console.error("❌ IPN không hợp lệ hoặc thanh toán thất bại:", {
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
//     console.error("💥 IPN Error:", error);
//     return NextResponse.json(
//       { RspCode: "99", Message: "Unknown error" },
//       { status: 500 }
//     );
//   }
// }
//app/api/vnpay/ipn/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import crypto from "crypto";

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const vnp_HashSecret = process.env.VNP_HASH_SECRET;

    const receivedSecureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sortedKeys = Object.keys(params).sort();
    const signData = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");

    const generatedSecureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData, "utf8")
      .digest("hex");

    if (receivedSecureHash !== generatedSecureHash) {
      return NextResponse.json({ RspCode: "97", Message: "Invalid Checksum" });
    }

    const { vnp_ResponseCode, vnp_Amount, vnp_TxnRef, vnp_TransactionNo } =
      params;

    // Kiểm tra đơn hàng
    const order = await Order.findOne({ trackingCode: vnp_TxnRef });

    if (!order) {
      return NextResponse.json({ RspCode: "01", Message: "Order Not Found" });
    }

    // Kiểm tra đơn đã được xử lý chưa
    if (order.status === "paid") {
      return NextResponse.json({
        RspCode: "02",
        Message: "Order already confirmed",
      });
    }

    // Kiểm tra số tiền
    if (order.amount * 100 !== parseInt(vnp_Amount)) {
      return NextResponse.json({ RspCode: "04", Message: "Invalid amount" });
    }

    // Nếu thanh toán thành công
    if (vnp_ResponseCode === "00") {
      order.status = "paid";
      order.vnp_TransactionNo = vnp_TransactionNo; // lưu nếu cần
      await order.save();
      return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      // Thanh toán thất bại, có thể cập nhật trạng thái khác tùy logic
      order.status = "failed";
      await order.save();
      return NextResponse.json({
        RspCode: "00",
        Message: "Payment Failed Recorded",
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
