import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product";
import mongoose from "mongoose";
import axios from "axios";
require("dotenv").config();

export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest Function to save user data to database
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      imageUrl: image_url,
    };
    await connectDB();
    await User.create(userData);
  }
);

// Inngest Function to Update user data in database
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.update" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      imageUrl: image_url,
    };
    await connectDB();
    await User.findByIdAndUpdate(id, userData);
  }
);

// Inngest Function to delete user from data
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await connectDB();
    await User.findByIdAndDelete(id);
  }
);

// Inngest Function to create user's order in database and process GHN
export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    batchEvents: {
      maxSize: 3, // Giảm batch size để xử lý nhanh hơn
      timeout: "3s", // Giảm timeout để responsive hơn
    },
    retries: 3, // Thêm retry cho reliability
  },
  { event: "order/created" },
  async ({ events }) => {
    await connectDB();

    for (const event of events) {
      const {
        orderId,
        userId,
        address,
        items,
        subtotal,
        tax,
        discount,
        amount,
        trackingCode,
        date,
        paymentMethod,
      } = event.data;

      // Kiểm tra dữ liệu
      if (!trackingCode) {
        console.error("❌ Missing trackingCode in event data:", event.data);
        continue; // Bỏ qua nếu thiếu trackingCode
      }

      // Lấy thông tin đơn hàng từ DB
      const order = await Order.findById(orderId).populate("address");
      if (!order) {
        console.error("❌ Order not found:", orderId);
        continue;
      }

      // Kiểm tra xem đơn hàng đã tồn tại chưa dựa trên trackingCode
      const existingOrder = await Order.findOne({ trackingCode });
      if (existingOrder && existingOrder._id.toString() !== orderId) {
        console.log("⚠️ Order already exists with trackingCode:", trackingCode);
        continue;
      }

      // Tạo hoặc cập nhật đơn hàng ban đầu
      await Order.findByIdAndUpdate(
        orderId,
        {
          userId,
          address: mongoose.Types.ObjectId.isValid(address)
            ? new mongoose.Types.ObjectId(address)
            : address,
          items,
          subtotal,
          tax,
          discount: discount || 0,
          amount,
          trackingCode,
          date,
          status: "pending",
        },
        { new: true, upsert: true }
      );

      // Giảm số lượng sản phẩm
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // Xử lý GHN nếu là COD
      if (paymentMethod === "cod" && order.status === "pending") {
        if (!order.address) {
          console.error("❌ Address not populated for order:", orderId);
          await Order.findByIdAndUpdate(orderId, {
            status: "ghn_failed",
            ghnError: "Address data missing",
          });
          continue;
        }

        const totalWeight = items.reduce(
          (sum, item) => sum + item.weight * item.quantity,
          0
        );

        const ghnPayload = {
          payment_type_id: 2,
          note: "Giao hàng QuickCart",
          required_note: "KHONGCHOXEMHANG",
          return_phone: "0911222333",
          return_address: "590 CMT8, P.11, Q.3, TP. HCM",
          return_district_id: null,
          return_ward_code: "",
          client_order_code: trackingCode,
          to_name: order.address.fullName,
          to_phone: order.address.phoneNumber,
          to_address: order.address.area,
          to_ward_code: order.address.wardCode,
          to_district_id: order.address.districtId,
          cod_amount: Math.round(amount),
          weight: Math.max(Math.round(totalWeight), 50), // Đảm bảo weight là số nguyên
          service_type_id: 2,
          items: items.map((item) => ({
            name: item.sku,
            quantity: item.quantity,
            price: Math.round(item.offerPrice), // Đảm bảo price là số nguyên
            weight: Math.max(Math.round(item.weight), 50), // Đảm bảo item weight là số nguyên
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
            timeout: 15000, // Tăng timeout lên 15s cho GHN API
          });

          const ghnData = ghnRes.data;
          console.log("📦 GHN createOrder response:", ghnData);

          if (ghnData.code === 200) {
            const newTrackingCode = ghnData.data.order_code;
            await Order.findByIdAndUpdate(orderId, {
              status: "Chờ lấy hàng",
              ghnOrderId: ghnData.data.order_id,
              trackingCode: newTrackingCode,
            });
            console.log(
              "✅ GHN createOrder success, updated trackingCode:",
              newTrackingCode
            );
          } else {
            throw new Error(
              `GHN failed with code ${ghnData.code}: ${ghnData.message}`
            );
          }
        } catch (err) {
          console.error("❌ GHN API error details:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
          });
          await Order.findByIdAndUpdate(orderId, {
            status: "ghn_failed",
            ghnError: err.response?.data?.message || err.message,
          });
        }
      }

      // Lấy lại order sau khi cập nhật để log giá trị mới
      const updatedOrder = await Order.findById(orderId);
      console.log(
        "✅ Processed order with trackingCode:",
        updatedOrder.trackingCode
      );
    }

    return { success: true, processed: events.length };
  }
);
