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
    const rawParams = Object.fromEntries(url.searchParams.entries());
    console.log("🔍 IPN Params:", rawParams);

    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const receivedSecureHash = rawParams.vnp_SecureHash;

    // Chỉ xóa vnp_SecureHash
    delete rawParams.vnp_SecureHash;

    // Giải mã các giá trị
    const decodedParams = {};
    for (const [key, value] of Object.entries(rawParams)) {
      decodedParams[key] = decodeURIComponent(value).replace(/\+/g, " ");
    }

    // Sắp xếp keys và tạo chuỗi ký
    const sortedKeys = Object.keys(decodedParams).sort();
    const signData = sortedKeys
      .map((key) => `${key}=${decodedParams[key]}`)
      .join("&");
    console.log("🔑 Sign Data:", signData);

    // Tạo chữ ký
    const generatedSecureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData, "utf8")
      .digest("hex");
    console.log("🔑 Generated Hash:", generatedSecureHash);
    console.log("🧾 Received Hash:", receivedSecureHash);

    // Kiểm tra chữ ký
    if (!receivedSecureHash) {
      console.error("❌ vnp_SecureHash is empty or missing");
      return NextResponse.json({
        RspCode: "99",
        Message: "Missing SecureHash",
      });
    }
    if (
      receivedSecureHash.toLowerCase() !== generatedSecureHash.toLowerCase()
    ) {
      console.error("❌ IPN failed - Invalid Checksum:", {
        generatedSecureHash,
        receivedSecureHash,
      });
      return NextResponse.json({ RspCode: "97", Message: "Invalid Checksum" });
    }

    const { vnp_ResponseCode, vnp_Amount, vnp_TxnRef, vnp_TransactionNo } =
      decodedParams;
    console.log("📋 Transaction Details:", {
      vnp_TxnRef,
      vnp_Amount,
      vnp_ResponseCode,
    });

    // Tìm đơn hàng
    const order = await Order.findOne({ trackingCode: vnp_TxnRef });
    if (!order) {
      console.warn("⚠️ Order not found:", vnp_TxnRef);
      return NextResponse.json({ RspCode: "01", Message: "Order Not Found" });
    }

    // Kiểm tra trạng thái đã xác nhận
    if (order.status === "paid") {
      console.log("ℹ️ Order already confirmed:", vnp_TxnRef);
      return NextResponse.json({
        RspCode: "02",
        Message: "Order already confirmed",
      });
    }

    // Kiểm tra số tiền
    const expectedAmount = order.amount * 100; // Đơn vị nhỏ
    if (parseInt(vnp_Amount) !== expectedAmount) {
      console.error("❌ Invalid amount:", {
        expected: expectedAmount,
        received: vnp_Amount,
      });
      return NextResponse.json({ RspCode: "04", Message: "Invalid amount" });
    }

    // Cập nhật trạng thái
    if (vnp_ResponseCode === "00") {
      order.status = "paid";
      order.vnp_TransactionNo = vnp_TransactionNo;
      await order.save();
      console.log("✅ Order updated:", { vnp_TxnRef, vnp_Amount });
      return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      order.status = "failed";
      await order.save();
      console.log("❌ Transaction failed recorded:", {
        vnp_TxnRef,
        vnp_ResponseCode,
      });
      return NextResponse.json({
        RspCode: "99",
        Message: "Transaction Failed",
      });
    }
  } catch (err) {
    console.error("💥 IPN Exception:", {
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json(
      { RspCode: "99", Message: `Exception: ${err.message}` },
      { status: 500 }
    );
  }
}
  