// import { Inngest } from "inngest";
// import connectDB from "./db";
// import User from "@/models/User";
// import Order from "@/models/Order"; // Đảm bảo import model Order
// import Product from "@/models/Product"; // Thêm để giảm stock

// // Create a client to send and receive events
// export const inngest = new Inngest({ id: "quickcart-next" });

// // Inngest Function to save user data to database
// export const syncUserCreation = inngest.createFunction(
//   { id: "sync-user-from-clerk" },
//   { event: "clerk/user.created" },
//   async ({ event }) => {
//     const { id, first_name, last_name, email_addresses, image_url } =
//       event.data;
//     const userData = {
//       _id: id,
//       email: email_addresses[0].email_address,
//       name: first_name + " " + last_name,
//       imageUrl: image_url,
//     };
//     await connectDB();
//     await User.create(userData);
//   }
// );

// // Inngest Function to Update user data in database
// export const syncUserUpdation = inngest.createFunction(
//   { id: "update-user-from-clerk" },
//   { event: "clerk/user.update" },
//   async ({ event }) => {
//     const { id, first_name, last_name, email_addresses, image_url } =
//       event.data;
//     const userData = {
//       _id: id,
//       email: email_addresses[0].email_address,
//       name: first_name + " " + last_name,
//       imageUrl: image_url,
//     };
//     await connectDB();
//     await User.findByIdAndUpdate(id, userData);
//   }
// );

// // Inngest Function to delete user from data
// export const syncUserDeletion = inngest.createFunction(
//   { id: "delete-user-with-clerk" },
//   { event: "clerk/user.deleted" },
//   async ({ event }) => {
//     const { id } = event.data;
//     await connectDB();
//     await User.findByIdAndDelete(id);
//   }
// );

// // Inngest Function to create user's order in database
// export const createUserOrder = inngest.createFunction(
//   {
//     id: "create-user-order",
//     batchEvents: {
//       maxSize: 5,
//       timeout: "5s",
//     },
//   },
//   { event: "order/created" },
//   async ({ events }) => {
//     await connectDB();

//     for (const event of events) {
//       const {
//         orderId,
//         userId,
//         address,
//         items,
//         subtotal,
//         tax,
//         discount,
//         amount,
//         date,
//       } = event.data;

//       // Tạo và lưu đơn hàng
//       const order = new Order({
//         _id: orderId,
//         userId,
//         address,
//         items,
//         subtotal,
//         tax,
//         discount: discount || 0,
//         amount,
//         date,
//         status: "pending",
//       });
//       await order.save();

//       // Giảm số lượng sản phẩm
//       for (const item of items) {
//         await Product.findByIdAndUpdate(item.product, {
//           $inc: { stock: -item.quantity },
//         });
//       }
//     }

//     return { success: true, processed: events.length };
//   }
// );
import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order"; // Đảm bảo import model Order
import Product from "@/models/Product"; // Thêm để giảm stock

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
        trackingCode, // Thêm trackingCode từ payload
        date,
      } = event.data;

      // Kiểm tra dữ liệu
      if (!trackingCode) {
        console.error("❌ Missing trackingCode in event data:", event.data);
        throw new Error("trackingCode is required");
      }

      // Tạo và lưu đơn hàng
      const order = new Order({
        _id: orderId,
        userId,
        address,
        items,
        subtotal,
        tax,
        discount: discount || 0,
        amount,
        trackingCode, // Thêm trackingCode vào schema
        date,
        status: "pending",
      });
      await order.save();

      // Giảm số lượng sản phẩm
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    return { success: true, processed: events.length };
  }
);
