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
import moment from "moment-timezone";

export async function GET(req) {
  await connectDB();

  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    console.log("🌐 IPN Request Params:", JSON.stringify(params, null, 2));

    const receivedSecureHash = params.vnp_SecureHash;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET; // Loại bỏ .trim() để khớp với ban đầu

    // Xóa các tham số không cần thiết
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    // Sắp xếp và tạo signData giống logic ban đầu
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
    const order = await Order.findOne({ trackingCode: vnp_TxnRef }).populate(
      "address"
    );

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

      // Thêm logic gọi GHN
      const totalWeight = order.items.reduce(
        (sum, item) => sum + (item.weight || 50) * item.quantity,
        0
      ); // Sử dụng weight mặc định 50 nếu null
      const currentTime = moment().tz("Asia/Ho_Chi_Minh");
      const pickupTime = currentTime
        .clone()
        .add(1, "day")
        .set({ hour: 8, minute: 0, second: 0 })
        .format("YYYY-MM-DD HH:mm:ss");

      const fullAddress = order.address; // Đã populate
      if (!fullAddress) {
        console.warn("⚠️ Address not found for order:", vnp_TxnRef);
        return NextResponse.json({
          RspCode: "03",
          Message: "Address Not Found",
        });
      }

      const ghnPayload = {
        payment_type_id: 1, // Prepaid vì đã thanh toán VNPay
        note: "Giao hàng QuickCart",
        required_note: "KHONGCHOXEMHANG",
        return_phone: "0911222333",
        return_address: "590 CMT8, P.11, Q.3, TP. HCM",
        return_district_id: null,
        return_ward_code: "",
        client_order_code: vnp_TxnRef,
        to_name: fullAddress.fullName,
        to_phone: fullAddress.phoneNumber,
        to_address: fullAddress.area,
        to_ward_code: fullAddress.wardCode,
        to_district_id: fullAddress.districtId,
        cod_amount: 0,
        weight: Math.max(totalWeight, 50), // Đảm bảo weight tối thiểu 50
        service_type_id: 2,
        items: order.items.map((item) => ({
          name: item.sku,
          quantity: item.quantity,
          price: item.offerPrice,
          weight: Math.max(item.weight || 50, 50), // Đảm bảo weight không null
        })),
      };

      console.log(
        "📤 GHN createOrder payload:",
        JSON.stringify(ghnPayload, null, 2)
      );

      try {
        const ghnRes = await axios.post(process.env.GHN_API_URL, ghnPayload, {
          headers: {
            "Content-Type": "application/json",
            Token: process.env.GHN_TOKEN,
            ShopId: process.env.GHN_SHOP_ID,
          },
        });

        const ghnData = ghnRes.data;
        console.log("📦 GHN createOrder response:", ghnData);

        if (ghnData.code === 200) {
          const ghnTrackingCode = ghnData.data.order_code;
          await Order.findByIdAndUpdate(order._id, {
            status: "ghn_success",
            ghnOrderId: ghnData.data.order_id,
            trackingCode: ghnTrackingCode,
          });
          console.log(
            `✅ GHN order created for: ${vnp_TxnRef}, tracking: ${ghnTrackingCode}`
          );
        } else {
          throw new Error(ghnData.message || "GHN request failed");
        }
      } catch (err) {
        console.error("❌ GHN API error:", err.response?.data || err.message);
        await Order.findByIdAndUpdate(order._id, {
          status: "ghn_failed",
          ghnError: err.response?.data?.message || err.message,
        });
      }

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
