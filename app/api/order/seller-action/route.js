// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Order from "@/models/Order";
// import { getAuth } from "@clerk/nextjs/server";
// import axios from "axios";

// export async function POST(req) {
//   await connectDB();

//   try {
//     const { userId } = getAuth(req);
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { orderId, action } = await req.json();

//     const order = await Order.findById(orderId);
//     if (!order) {
//       return NextResponse.json(
//         { success: false, message: "Order not found" },
//         { status: 404 }
//       );
//     }

//     if (action === "confirm") {
//       if (order.status === "pending") {
//         order.status = "paid";
//         await order.save();
//       } else if (order.status === "paid" || order.status === "ghn_success") {
//         if (order.trackingCode?.startsWith("TEMP-")) {
//           const ghnPayload = {
//             payment_type_id: order.paymentMethod === "cod" ? 2 : 1,
//             note: "Giao hàng QuickCart",
//             required_note: "KHONGCHOXEMHANG",
//             return_phone: "0911222333",
//             return_address: "590 CMT8, P.11, Q.3, TP. HCM",
//             to_name: order.address.fullName,
//             to_phone: order.address.phoneNumber,
//             to_address: order.address.area,
//             to_ward_code: order.address.wardCode || "20602",
//             to_district_id: order.address.districtId,
//             cod_amount: order.paymentMethod === "cod" ? order.amount : 0,
//             weight: order.items.reduce(
//               (sum, item) => sum + (item.weight || 50) * item.quantity,
//               0
//             ),
//             service_type_id: 2,
//             items: order.items.map((item) => ({
//               name: item.sku,
//               quantity: item.quantity,
//               price: item.offerPrice,
//               weight: item.weight || 50,
//             })),
//           };

//           try {
//             const ghnRes = await axios.post(
//               process.env.GHN_API_URL,
//               ghnPayload,
//               {
//                 headers: {
//                   "Content-Type": "application/json",
//                   Token: process.env.GHN_TOKEN,
//                   ShopId: process.env.GHN_SHOP_ID,
//                 },
//               }
//             );

//             if (ghnRes.data.code === 200) {
//               order.status = "shipped"; // Chuyển thẳng sang shipped khi GHN thành công
//               order.trackingCode = ghnRes.data.data.order_code;
//               order.ghnTrackingCode = ghnRes.data.data.order_code;
//               await order.save();
//             } else {
//               throw new Error(`GHN failed: ${ghnRes.data.message}`);
//             }
//           } catch (ghnError) {
//             console.error("GHN Error:", ghnError.message);
//             order.status = "ghn_failed";
//             order.trackingCode = `TEMP-${order.trackingCode}`;
//             await order.save();
//             return NextResponse.json({
//               success: false,
//               message: `Xác nhận thành công nhưng GHN thất bại: ${ghnError.message}`,
//             });
//           }
//         } else {
//           // Nếu đã có trackingCode hợp lệ (không TEMP-), chuyển sang shipped
//           order.status = "shipped";
//           await order.save();
//         }
//       } else {
//         return NextResponse.json(
//           { success: false, message: "Không thể xác nhận đơn hàng" },
//           { status: 400 }
//         );
//       }
//       return NextResponse.json({
//         success: true,
//         message: "Đơn hàng đã được xác nhận và chuyển sang đang giao",
//       });
//     } else if (action === "cancel") {
//       if (["pending", "paid", "ghn_success"].includes(order.status)) {
//         // Thử hủy GHN trước nếu có trackingCode
//         if (order.ghnTrackingCode) {
//           try {
//             const cancelRes = await axios.post(
//               `${process.env.GHN_API_URL}/cancel`,
//               { order_code: order.ghnTrackingCode },
//               {
//                 headers: {
//                   "Content-Type": "application/json",
//                   Token: process.env.GHN_TOKEN,
//                   ShopId: process.env.GHN_SHOP_ID,
//                 },
//               }
//             );
//             if (cancelRes.data.code !== 200) {
//               throw new Error(`GHN cancel failed: ${cancelRes.data.message}`);
//             }
//           } catch (ghnCancelError) {
//             console.warn("GHN Cancel Error:", ghnCancelError.message);
//             // Tiếp tục hủy dù GHN thất bại để đảm bảo trạng thái trên server
//           }
//         }
//         order.status = "canceled";
//         order.trackingCode = null; // Xóa trackingCode khi hủy
//         order.ghnTrackingCode = null;
//         await order.save();
//         return NextResponse.json({
//           success: true,
//           message: "Đơn hàng đã bị hủy",
//         });
//       } else {
//         return NextResponse.json(
//           { success: false, message: "Không thể hủy đơn hàng" },
//           { status: 400 }
//         );
//       }
//     } else {
//       return NextResponse.json(
//         { success: false, message: "Hành động không hợp lệ" },
//         { status: 400 }
//       );
//     }
//   } catch (error) {
//     console.error("Seller action error:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error: " + error.message },
//       { status: 500 }
//     );
//   }
// }
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
      if (
        ["pending", "paid", "Chờ lấy hàng", "ghn_success"].includes(
          order.status
        )
      ) {
        if (order.status === "pending") {
          order.status = "paid"; // Chuyển sang paid nếu chưa thanh toán
          await order.save();
          return NextResponse.json({
            success: true,
            message: "Đơn hàng đã được xác nhận và chuyển sang đã thanh toán",
          });
        } else if (order.trackingCode?.startsWith("TEMP-")) {
          // Gọi GHN để tạo đơn nếu trackingCode là TEMP-
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
              order.status = "Chờ lấy hàng"; // Chuyển sang Chờ lấy hàng sau khi GHN tạo mã
              order.trackingCode = ghnRes.data.data.order_code;
              await order.save();
              return NextResponse.json({
                success: true,
                message: "Đơn hàng đã được xác nhận và chờ GHN lấy hàng",
              });
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
              message: `Xác nhận thất bại do GHN: ${ghnError.message}`,
            });
          }
        } else if (
          order.status === "Chờ lấy hàng" ||
          order.status === "ghn_success"
        ) {
          // Xác nhận để chuyển sang Đang giao
          order.status = "shipped";
          await order.save();
          return NextResponse.json({
            success: true,
            message: "Đơn hàng đã được xác nhận và chuyển sang đang giao",
          });
        }
      } else {
        return NextResponse.json(
          { success: false, message: "Không thể xác nhận đơn hàng" },
          { status: 400 }
        );
      }
    } else if (action === "cancel") {
      if (
        ["pending", "paid", "Chờ lấy hàng", "ghn_success"].includes(
          order.status
        )
      ) {
        // Thử hủy GHN nếu có trackingCode
        if (order.trackingCode && !order.trackingCode.startsWith("TEMP-")) {
          try {
            const cancelRes = await axios.post(
              `${process.env.GHN_API_URL}/cancel`,
              { order_code: order.trackingCode },
              {
                headers: {
                  "Content-Type": "application/json",
                  Token: process.env.GHN_TOKEN,
                  ShopId: process.env.GHN_SHOP_ID,
                },
              }
            );
            if (cancelRes.data.code !== 200) {
              throw new Error(`GHN cancel failed: ${cancelRes.data.message}`);
            }
          } catch (ghnCancelError) {
            console.warn("GHN Cancel Error:", ghnCancelError.message);
            // Tiếp tục hủy dù GHN thất bại
          }
        }
        order.status = "canceled";
        order.trackingCode = null; // Xóa trackingCode khi hủy
        await order.save();
        return NextResponse.json({
          success: true,
          message: "Đơn hàng đã bị hủy",
        });
      } else {
        return NextResponse.json(
          { success: false, message: "Không thể hủy đơn hàng" },
          { status: 400 }
        );
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
