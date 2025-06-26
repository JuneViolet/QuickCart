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
import crypto from "crypto";
import connectDB from "@/config/db";
import Order from "@/models/Order";

// VNPAY IPN gửi bằng phương thức GET
export async function GET(req) {
  try {
    await connectDB();
    console.log("IPN Request received at:", new Date().toISOString(), req.url);

    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    console.log("IPN Params:", params);

    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const vnp_SecureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;

    const sortedKeys = Object.keys(params).sort();
    const signData = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
    console.log("IPN Sign Data:", signData);

    const secureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData, "utf8")
      .digest("hex");
    console.log("Calculated SecureHash:", secureHash);
    console.log("Received vnp_SecureHash:", vnp_SecureHash);

    if (secureHash === vnp_SecureHash && params.vnp_ResponseCode === "00") {
      const trackingCode = params.vnp_TxnRef;
      const amount = parseInt(params.vnp_Amount, 10) / 100;

      const updated = await Order.findOneAndUpdate(
        { trackingCode },
        { $set: { status: "paid" } },
        { new: true } // Trả về document đã cập nhật
      );

      if (!updated) {
        console.warn("⚠️ Order not found with trackingCode:", trackingCode);
        return NextResponse.json({ RspCode: "01", Message: "Order not found" });
      }

      console.log("✅ Order updated:", {
        trackingCode,
        amount,
        transactionNo: params.vnp_TransactionNo,
        updatedStatus: updated.status,
      });
      return NextResponse.json({ RspCode: "00", Message: "Success" });
    } else {
      console.error("❌ IPN failed:", {
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
    console.error("💥 IPN Error:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { RspCode: "99", Message: "Unknown error" },
      { status: 500 }
    );
  }
}
