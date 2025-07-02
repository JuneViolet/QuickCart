import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import axios from "axios"; // Thêm để gọi GHN
import moment from "moment-timezone"; // Thêm để xử lý thời gian
import Address from "@/models/Address"; // Thêm để lấy thông tin địa chỉ

export async function POST(request) {
  await connectDB();

  try {
    // Lấy token từ header (từ Clerk qua AppContext)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("Unauthorized request: Missing or invalid token");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const token = authHeader.split(" ")[1];

    const { trackingCode, responseCode } = await request.json();
    console.log("Received verify-payment request:", {
      trackingCode,
      responseCode,
    });

    const order = await Order.findOne({ trackingCode });

    if (!order) {
      console.warn("Order not found:", trackingCode);
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Kiểm tra trạng thái hiện tại để tránh cập nhật không cần thiết
    if (order.status === "paid" || order.status === "ghn_success") {
      console.log("Order already processed:", trackingCode);
      return NextResponse.json({
        success: true,
        message: "Order already processed",
        trackingCode: order.trackingCode,
      });
    }

    if (responseCode === "00") {
      order.status = "paid";
      await order.save();
      console.log("Payment verified for order:", trackingCode);

      // Gọi API GHN để tạo đơn vận chuyển (tương tự luồng IPN)
      const fullAddress = await Address.findById(order.address);
      const totalWeight = order.items.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0
      );
      const currentTime = moment().tz("Asia/Ho_Chi_Minh");
      const pickupTime = currentTime
        .clone()
        .add(1, "day")
        .set({ hour: 8, minute: 0, second: 0 })
        .format("YYYY-MM-DD HH:mm:ss");
      const orderDateStr = currentTime.format("YYYY-MM-DD HH:mm:ss");

      const ghnPayload = {
        payment_type_id: 1, // Prepaid vì đã thanh toán VNPay
        note: "Giao hàng QuickCart",
        required_note: "KHONGCHOXEMHANG",
        return_phone: "0911222333",
        return_address: "590 CMT8, P.11, Q.3, TP. HCM",
        return_district_id: null,
        return_ward_code: "",
        client_order_code: trackingCode,
        to_name: fullAddress.fullName,
        to_phone: fullAddress.phoneNumber,
        to_address: fullAddress.area,
        to_ward_code: fullAddress.wardCode,
        to_district_id: fullAddress.districtId,
        cod_amount: 0, // Không cần COD vì đã thanh toán
        weight: Math.max(totalWeight, 50),
        service_type_id: 2, // Express
        items: order.items.map((item) => ({
          name: item.sku,
          quantity: item.quantity,
          price: item.offerPrice,
          weight: Math.max(item.weight, 50),
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
            `✅ GHN order created for: ${trackingCode}, tracking: ${ghnTrackingCode}`
          );
          return NextResponse.json({
            success: true,
            message: "Payment and shipping order created",
            trackingCode: ghnTrackingCode,
          });
        } else {
          throw new Error(ghnData.message || "GHN request failed");
        }
      } catch (err) {
        console.error("❌ GHN API error:", err.response?.data || err.message);
        // Không rollback stock ở đây vì đã giảm trong IPN, chỉ cập nhật trạng thái lỗi
        await Order.findByIdAndUpdate(order._id, {
          status: "ghn_failed",
          ghnError: err.response?.data?.message || err.message,
        });
        return NextResponse.json(
          { success: false, message: `GHN failed: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      order.status = "failed";
      await order.save();
      console.log("Payment failed for order:", trackingCode);
      return NextResponse.json(
        { success: false, message: "Payment failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
