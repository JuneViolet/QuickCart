import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product";

// Create a client to send and receive events
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

// Inngest Function to create user's order in database
export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    batchEvents: {
      maxSize: 5,
      timeout: "5s",
    },
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
      } = event.data;

      // Kiểm tra dữ liệu
      if (!trackingCode) {
        console.error("❌ Missing trackingCode in event data:", event.data);
        continue; // Bỏ qua nếu thiếu trackingCode
      }

      // Kiểm tra xem đơn hàng đã tồn tại chưa
      const existingOrder = await Order.findOne({ trackingCode });
      if (existingOrder) {
        console.log("⚠️ Order already exists with trackingCode:", trackingCode);
        continue; // Bỏ qua nếu đã tồn tại
      }

      // Tạo hoặc cập nhật đơn hàng
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          userId,
          address,
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

      console.log("✅ Processed order with trackingCode:", trackingCode);
    }

    return { success: true, processed: events.length };
  }
);
