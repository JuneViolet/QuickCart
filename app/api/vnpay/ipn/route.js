import { NextResponse } from "next/server";

export async function POST(req) {
  const {
    vnp_Amount,
    vnp_BankCode,
    vnp_BankTranNo,
    vnp_CardType,
    vnp_PayDate,
    vnp_ResponseCode,
    vnp_TmnCode,
    vnp_TransactionNo,
    vnp_TxnRef,
    vnp_SecureHash,
  } = await req.json();

  const vnp_HashSecret = process.env.VNP_HASH_SECRET; // SHJDW11ZBY6OZVHSUJSVUEESNL5ENCGN
  const signData = Object.keys(req.body)
    .filter((key) => key.startsWith("vnp_") && key !== "vnp_SecureHash")
    .sort()
    .map((key) => `${key}=${req.body[key]}`)
    .join("&");
  const crypto = require("crypto");
  const secureHash = crypto
    .createHash("sha256")
    .update(signData + vnp_HashSecret)
    .digest("hex");

  if (secureHash === vnp_SecureHash && vnp_ResponseCode === "00") {
    // TODO: Lưu trạng thái thanh toán vào DB (ví dụ: cập nhật order với vnp_TxnRef)
    console.log("IPN Success:", { vnp_TxnRef, vnp_Amount, vnp_TransactionNo });
    return NextResponse.json({ RspCode: "00", Message: "Success" });
  } else {
    console.error("IPN Failed:", {
      vnp_ResponseCode,
      secureHash,
      vnp_SecureHash,
    });
    return NextResponse.json(
      { RspCode: "99", Message: "Failed" },
      { status: 400 }
    );
  }
}
