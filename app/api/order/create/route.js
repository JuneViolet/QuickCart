// import { inngest } from "@/config/inngest";
// import Product from "@/models/Product";
// import User from "@/models/User";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   try {
//     const { userId } = getAuth(request);
//     const { address, items, promoCode, discount } = await request.json();

//     // Kiểm tra dữ liệu đầu vào
//     if (!address || items.length === 0) {
//       return NextResponse.json({ success: false, message: "Invalid data" });
//     }

//     // Tính tổng tiền sản phẩm (subtotal)
//     const subtotal = await items.reduce(async (acc, item) => {
//       const product = await Product.findById(item.product);
//       const accumulator = await acc; // Giải quyết promise từ accumulator
//       return accumulator + product.offerPrice * item.quantity;
//     }, 0);

//     // Tính thuế (2%)
//     const tax = Math.floor(subtotal * 0.02);

//     // Tính tổng tiền cuối cùng (bao gồm thuế và giảm giá)
//     const finalAmount = subtotal + tax - (discount || 0);

//     // Gửi sự kiện tới Inngest
//     await inngest.send({
//       name: "order/created",
//       data: {
//         userId,
//         address,
//         items,
//         subtotal, // Thêm subtotal để theo dõi
//         tax, // Thêm thuế để theo dõi
//         discount: discount || 0, // Thêm discount (mặc định là 0 nếu không có)
//         promoCode: promoCode || null, // Thêm promoCode (mặc định là null nếu không có)
//         amount: finalAmount, // Tổng tiền cuối cùng
//         date: Date.now(),
//       },
//     });

//     // Xóa giỏ hàng của người dùng
//     const user = await User.findById(userId);
//     user.cartItems = {};
//     await user.save();

//     return NextResponse.json({ success: true, message: "Order Placed" });
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json({ success: false, message: error.message });
//   }
// }
import connectDB from "@/config/db"; // Thêm kết nối database
import { inngest } from "@/config/inngest";
import Order from "@/models/Order"; // Thêm model Order
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose"; // Thêm mongoose để kiểm tra ObjectId

export async function POST(request) {
  try {
    // Kết nối database
    await connectDB();

    const { userId } = getAuth(request);
    const { address, items, promoCode, discount } = await request.json();

    // Kiểm tra userId
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Kiểm tra dữ liệu đầu vào
    if (!address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    // Kiểm tra và tính tổng tiền sản phẩm (subtotal)
    let subtotal = 0;
    const updatedItems = [];

    for (const item of items) {
      // Kiểm tra item.product có phải ObjectId hợp lệ không
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return NextResponse.json(
          { success: false, message: `Invalid product ID: ${item.product}` },
          { status: 400 }
        );
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product with ID ${item.product} not found`,
          },
          { status: 404 }
        );
      }

      // Kiểm tra stock
      if (product.stock < item.quantity) {
        return NextResponse.json({
          success: false,
          message: `Not enough stock for product ${product.name}. Available: ${product.stock}`,
        });
      }

      subtotal += product.offerPrice * item.quantity;

      // Lưu thêm thông tin brand vào items (tùy chọn)
      updatedItems.push({
        product: item.product, // Đảm bảo là ObjectId
        quantity: item.quantity,
        brand: product.brand,
      });
    }

    // Giảm stock cho từng sản phẩm
    for (const item of items) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

    // Tính thuế (2%)
    const tax = Math.floor(subtotal * 0.02);

    // Tính tổng tiền cuối cùng (bao gồm thuế và giảm giá)
    const finalAmount = subtotal + tax - (discount || 0);

    // Lưu đơn hàng vào database
    const order = new Order({
      userId,
      items: updatedItems,
      amount: finalAmount,
      address,
      status: "Order Placed",
      date: Date.now(),
    });
    await order.save();

    // Gửi sự kiện tới Inngest
    await inngest.send({
      name: "order/created",
      data: {
        userId,
        address,
        items: updatedItems,
        subtotal,
        tax,
        discount: discount || 0,
        promoCode: promoCode || null,
        amount: finalAmount,
        date: Date.now(),
        orderId: order._id, // Thêm orderId vào sự kiện
      },
    });

    // Xóa giỏ hàng của người dùng
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    user.cartItems = {};
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Order Placed",
      order: {
        id: order._id,
        amount: finalAmount,
      },
    });
  } catch (error) {
    console.error("Error in /api/order/create:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
