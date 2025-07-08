// // // app/api/vnpay/ipn/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Order from "@/models/Order";
// import crypto from "crypto";
// import axios from "axios";
// import moment from "moment-timezone";

// export async function GET(req) {
//   try {
//     await connectDB();

//     const url = new URL(req.url);
//     const params = Object.fromEntries(url.searchParams.entries());
//     const receivedSecureHash = params.vnp_SecureHash;
//     const vnp_HashSecret = process.env.VNP_HASH_SECRET?.trim();

//     console.log("🌐 IPN Request URL:", req.url);
//     console.log("📥 Raw VNPAY Params:", JSON.stringify(params, null, 2));
//     console.log("🔑 ENV HASH SECRET:", JSON.stringify(vnp_HashSecret));

//     delete params.vnp_SecureHash;
//     delete params.vnp_SecureHashType;

//     const sortedKeys = Object.keys(params).sort();
//     const encode = (str) => encodeURIComponent(str).replace(/%20/g, "+");
//     const signData = sortedKeys
//       .map((key) => `${encode(key)}=${encode(params[key])}`)
//       .join("&");
//     const generatedSecureHash = crypto
//       .createHmac("sha512", vnp_HashSecret)
//       .update(signData, "utf8")
//       .digest("hex");

//     console.log("🔑 Sorted Keys:", sortedKeys);
//     console.log("🧾 Sign Data:", signData);
//     console.log("📨 Received Hash:", receivedSecureHash);
//     console.log("✅ Generated Hash:", generatedSecureHash);

//     if (
//       receivedSecureHash?.toLowerCase() !== generatedSecureHash.toLowerCase()
//     ) {
//       console.warn("❌ Hash mismatch. Check failed.");
//       return NextResponse.json({ RspCode: "97", Message: "Invalid Checksum" });
//     }

//     const { vnp_TxnRef, vnp_Amount, vnp_ResponseCode, vnp_TransactionNo } =
//       params;
//     const order = await Order.findOne({ trackingCode: vnp_TxnRef }).populate(
//       "address"
//     );

//     if (!order) {
//       console.warn(`⚠️ Order not found: ${vnp_TxnRef}`);
//       return NextResponse.json({ RspCode: "01", Message: "Order Not Found" });
//     }

//     if (order.status === "paid" || order.status === "ghn_success") {
//       console.log(`ℹ️ Order already confirmed: ${vnp_TxnRef}`);
//       return NextResponse.json({
//         RspCode: "02",
//         Message: "Order already confirmed",
//       });
//     }

//     const expectedAmount = order.amount * 100;
//     if (parseInt(vnp_Amount) !== expectedAmount) {
//       console.warn(
//         `❗ Invalid amount: Expected ${expectedAmount}, got ${vnp_Amount}`
//       );
//       return NextResponse.json({ RspCode: "04", Message: "Invalid amount" });
//     }

//     if (vnp_ResponseCode === "00") {
//       order.status = "paid";
//       order.vnp_TransactionNo = vnp_TransactionNo;
//       await order.save();
//       console.log(`✅ Payment confirmed for: ${vnp_TxnRef}`);

//       const totalWeight = order.items.reduce(
//         (sum, item) => sum + (item.weight || 50) * item.quantity,
//         0
//       );
//       const currentTime = moment().tz("Asia/Ho_Chi_Minh");
//       const pickupTime = currentTime
//         .clone()
//         .add(1, "day")
//         .set({ hour: 8, minute: 0, second: 0 })
//         .format("YYYY-MM-DD HH:mm:ss");

//       const fullAddress = order.address;
//       if (!fullAddress) {
//         console.warn("⚠️ Address not found for order:", vnp_TxnRef);
//         return NextResponse.json({
//           RspCode: "03",
//           Message: "Address Not Found",
//         });
//       }

//       const ghnPayload = {
//         payment_type_id: 1, // Thanh toán trước (VNPay)
//         note: "Giao hàng QuickCart",
//         required_note: "KHONGCHOXEMHANG",
//         return_phone: "0911222333",
//         return_address: "590 CMT8, P.11, Q.3, TP. HCM",
//         return_district_id: null,
//         return_ward_code: "",
//         client_order_code: vnp_TxnRef,
//         to_name: fullAddress.fullName,
//         to_phone: fullAddress.phoneNumber,
//         to_address: fullAddress.area,
//         to_ward_code: fullAddress.wardCode || "20602",
//         to_district_id: fullAddress.districtId,
//         cod_amount: 0,
//         weight: Math.max(totalWeight, 50),
//         service_type_id: 2,
//         items: order.items.map((item) => ({
//           name: item.sku,
//           quantity: item.quantity,
//           price: item.offerPrice,
//           weight: Math.max(item.weight || 50, 50),
//         })),
//       };

//       console.log(
//         "📤 GHN createOrder payload:",
//         JSON.stringify(ghnPayload, null, 2)
//       );

//       try {
//         const ghnRes = await axios.post(process.env.GHN_API_URL, ghnPayload, {
//           headers: {
//             "Content-Type": "application/json",
//             Token: process.env.GHN_TOKEN,
//             ShopId: process.env.GHN_SHOP_ID,
//           },
//         });

//         const ghnData = ghnRes.data;
//         console.log("📦 GHN createOrder response:", ghnData);

//         if (ghnData.code === 200) {
//           const ghnTrackingCode = ghnData.data.order_code;
//           await Order.findByIdAndUpdate(order._id, {
//             status: "ghn_success",
//             trackingCode: ghnTrackingCode, // Cập nhật trackingCode bằng mã GHN
//             ghnOrderId: ghnData.data.order_id, // Lưu ghnOrderId
//           });
//           console.log(
//             `✅ GHN order created for: ${vnp_TxnRef}, tracking: ${ghnTrackingCode}`
//           );
//         } else {
//           throw new Error(ghnData.message || "GHN request failed");
//         }
//       } catch (err) {
//         console.error("❌ GHN API error:", err.response?.data || err.message);
//         await Order.findByIdAndUpdate(order._id, {
//           status: "ghn_failed",
//           ghnError: err.response?.data?.message || err.message,
//         });
//         // Không rollback vì thanh toán đã thành công, chỉ ghi nhận lỗi GHN
//       }

//       return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
//     } else {
//       order.status = "failed";
//       await order.save();
//       console.warn(`❌ Payment failed for: ${vnp_TxnRef}`);
//       return NextResponse.json({
//         RspCode: "00",
//         Message: "Transaction Failed Recorded",
//       });
//     }
//   } catch (err) {
//     console.error("💥 IPN Exception:", err);
//     return NextResponse.json(
//       { RspCode: "99", Message: `Exception: ${err.message}` },
//       { status: 500 }
//     );
//   }
// }
// /api/vnpay/ipn/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import crypto from "crypto";
import axios from "axios";
import moment from "moment-timezone";

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const receivedSecureHash = params.vnp_SecureHash;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET?.trim();

    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sortedKeys = Object.keys(params).sort();
    const encode = (str) => encodeURIComponent(str).replace(/%20/g, "+");
    const signData = sortedKeys
      .map((key) => `${encode(key)}=${encode(params[key])}`)
      .join("&");
    const generatedSecureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData, "utf8")
      .digest("hex");

    if (
      receivedSecureHash?.toLowerCase() !== generatedSecureHash.toLowerCase()
    ) {
      return NextResponse.json({ RspCode: "97", Message: "Invalid Checksum" });
    }

    const { vnp_TxnRef, vnp_Amount, vnp_ResponseCode, vnp_TransactionNo } =
      params;
    const order = await Order.findOne({ trackingCode: vnp_TxnRef }).populate(
      "address"
    );

    if (!order) {
      return NextResponse.json({ RspCode: "01", Message: "Order Not Found" });
    }

    if (order.status === "paid" || order.status === "ghn_success") {
      return NextResponse.json({
        RspCode: "02",
        Message: "Order already confirmed",
      });
    }

    const expectedAmount = order.amount * 100;
    if (parseInt(vnp_Amount) !== expectedAmount) {
      return NextResponse.json({ RspCode: "04", Message: "Invalid amount" });
    }

    if (vnp_ResponseCode === "00") {
      order.status = "paid";
      order.vnp_TransactionNo = vnp_TransactionNo;
      await order.save();

      const totalWeight = order.items.reduce(
        (sum, item) => sum + (item.weight || 50) * item.quantity,
        0
      );
      const fullAddress = order.address;

      if (!fullAddress) {
        return NextResponse.json({
          RspCode: "03",
          Message: "Address Not Found",
        });
      }

      const ghnPayload = {
        payment_type_id: 1,
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
        to_ward_code: fullAddress.wardCode || "20602",
        to_district_id: fullAddress.districtId,
        cod_amount: 0,
        weight: Math.max(totalWeight, 50),
        service_type_id: 2,
        items: order.items.map((item) => ({
          name: item.sku,
          quantity: item.quantity,
          price: item.offerPrice,
          weight: Math.max(item.weight || 50, 50),
        })),
      };

      try {
        const ghnRes = await axios.post(process.env.GHN_API_URL, ghnPayload, {
          headers: {
            "Content-Type": "application/json",
            Token: process.env.GHN_TOKEN,
            ShopId: process.env.GHN_SHOP_ID,
          },
        });

        const ghnData = ghnRes.data;

        if (ghnData.code === 200) {
          const ghnTrackingCode = ghnData.data.order_code;
          await Order.findByIdAndUpdate(order._id, {
            status: "ghn_success",
            ghnTrackingCode,
            ghnOrderId: ghnData.data.order_id,
          });
        } else {
          throw new Error(ghnData.message || "GHN request failed");
        }
      } catch (err) {
        await Order.findByIdAndUpdate(order._id, {
          status: "ghn_failed",
          ghnError: err.response?.data?.message || err.message,
        });
      }

      return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      order.status = "failed";
      await order.save();
      return NextResponse.json({
        RspCode: "00",
        Message: "Transaction Failed Recorded",
      });
    }
  } catch (err) {
    return NextResponse.json(
      { RspCode: "99", Message: `Exception: ${err.message}` },
      { status: 500 }
    );
  }
}
