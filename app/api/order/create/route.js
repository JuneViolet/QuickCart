
import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items, promoCode, discount } = await request.json();

    // Kiểm tra dữ liệu đầu vào
    if (!address || items.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid data" });
    }

    // Tính tổng tiền sản phẩm (subtotal)
    const subtotal = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      const accumulator = await acc; // Giải quyết promise từ accumulator
      return accumulator + product.offerPrice * item.quantity;
    }, 0);

    // Tính thuế (2%)
    const tax = Math.floor(subtotal * 0.02);

    // Tính tổng tiền cuối cùng (bao gồm thuế và giảm giá)
    const finalAmount = subtotal + tax - (discount || 0);

    // Gửi sự kiện tới Inngest
    await inngest.send({
      name: "order/created",
      data: {
        userId,
        address,
        items,
        subtotal, // Thêm subtotal để theo dõi
        tax, // Thêm thuế để theo dõi
        discount: discount || 0, // Thêm discount (mặc định là 0 nếu không có)
        promoCode: promoCode || null, // Thêm promoCode (mặc định là null nếu không có)
        amount: finalAmount, // Tổng tiền cuối cùng
        date: Date.now(),
      },
    });

    // Xóa giỏ hàng của người dùng
    const user = await User.findById(userId);
    user.cartItems = {};
    await user.save();

    return NextResponse.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
