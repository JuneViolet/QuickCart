import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import axios from "axios";

export async function POST(req) {
  await connectDB();

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId, action } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (action === "confirm") {
      if (order.status === "pending") {
        order.status = "paid";
        await order.save();

        if (order.trackingCode?.startsWith("TEMP-")) {
          const ghnPayload = {
            payment_type_id: order.paymentMethod === "cod" ? 2 : 1,
            note: "Giao hàng QuickCart",
            required_note: "KHONGCHOXEMHANG",
            return_phone: "0911222333",
            return_address: "590 CMT8, P.11, Q.3, TP. HCM",
            to_name: order.address.fullName,
            to_phone: order.address.phoneNumber,
            to_address: order.address.area,
            to_ward_code: order.address.wardCode || "20602",
            to_district_id: order.address.districtId,
            cod_amount: order.paymentMethod === "cod" ? order.amount : 0,
            weight: order.items.reduce(
              (sum, item) => sum + (item.weight || 50) * item.quantity,
              0
            ),
            service_type_id: 2,
            items: order.items.map((item) => ({
              name: item.sku,
              quantity: item.quantity,
              price: item.offerPrice,
              weight: item.weight || 50,
            })),
          };

          try {
            const ghnRes = await axios.post(
              process.env.GHN_API_URL,
              ghnPayload,
              {
                headers: {
                  "Content-Type": "application/json",
                  Token: process.env.GHN_TOKEN,
                  ShopId: process.env.GHN_SHOP_ID,
                },
              }
            );

            if (ghnRes.data.code === 200) {
              order.status = "ghn_success";
              order.trackingCode = ghnRes.data.data.order_code;
              order.ghnTrackingCode = ghnRes.data.data.order_code;
              await order.save();
            } else {
              throw new Error(`GHN failed: ${ghnRes.data.message}`);
            }
          } catch (ghnError) {
            console.error("GHN Error:", ghnError.message);
            order.status = "ghn_failed";
            order.trackingCode = `TEMP-${order.trackingCode}`;
            await order.save();
            return NextResponse.json({
              success: false,
              message: `Xác nhận thành công nhưng GHN thất bại: ${ghnError.message}`,
            });
          }
        }
      } else if (order.status === "ghn_success") {
        // Xác nhận thêm (ví dụ: chuyển sang shipped)
        order.status = "shipped";
        await order.save();
      }
      return NextResponse.json({
        success: true,
        message: "Đơn hàng đã được xác nhận",
      });
    } else if (action === "cancel") {
      if (["pending", "paid", "ghn_success"].includes(order.status)) {
        order.status = "canceled";
        await order.save();
        // Thêm logic hủy GHN nếu có ghnTrackingCode
        if (order.ghnTrackingCode) {
          try {
            await axios.post(
              `${process.env.GHN_API_URL}/cancel`,
              { order_code: order.ghnTrackingCode },
              {
                headers: {
                  "Content-Type": "application/json",
                  Token: process.env.GHN_TOKEN,
                  ShopId: process.env.GHN_SHOP_ID,
                },
              }
            );
          } catch (ghnCancelError) {
            console.warn("GHN Cancel Error:", ghnCancelError.message);
          }
        }
        return NextResponse.json({
          success: true,
          message: "Đơn hàng đã bị hủy",
        });
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Hành động không hợp lệ" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Seller action error:", error);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
