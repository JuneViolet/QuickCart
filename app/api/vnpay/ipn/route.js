import { NextResponse } from "next/server";
import crypto from "crypto";

// VNPAY IPN luôn gửi bằng GET (query string), nên ta dùng request.url để lấy
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());

    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const vnp_SecureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;

    // Sắp xếp & tạo chuỗi hash data
    const sortedKeys = Object.keys(params).sort();
    const signData = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");

    const secureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData, "utf8")
      .digest("hex");

    if (secureHash === vnp_SecureHash && params.vnp_ResponseCode === "00") {
      // TODO: cập nhật trạng thái đơn hàng trong DB nếu cần
      console.log("✅ IPN hợp lệ:", {
        orderId: params.vnp_TxnRef,
        amount: params.vnp_Amount,
        transactionNo: params.vnp_TransactionNo,
      });

      return NextResponse.json({ RspCode: "00", Message: "Success" });
    } else {
      console.error("❌ IPN không hợp lệ hoặc thanh toán thất bại:", {
        responseCode: params.vnp_ResponseCode,
        secureHash,
        vnp_SecureHash,
      });
      return NextResponse.json(
        { RspCode: "97", Message: "Invalid Signature or Failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("💥 IPN Error:", error);
    return NextResponse.json(
      { RspCode: "99", Message: "Unknown error" },
      { status: 500 }
    );
  }
}
