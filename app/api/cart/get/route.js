// import connectDB from "@/config/db";
// import User from "@/models/User";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);

//     await connectDB();
//     const user = await User.findById(userId);

//     const { cartItems } = user;

//     return NextResponse.json({ success: true, cartItems });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: error.message });
//   }
// }
// import connectDB from "@/config/db";
// import User from "@/models/User";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     await connectDB();
//     const user = await User.findById(userId);
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "User not found" },
//         { status: 404 }
//       );
//     }

//     const { cartItems } = user;
//     return NextResponse.json({ success: true, cartItems });
//   } catch (error) {
//     console.error("Error fetching cart:", error.message);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
import connectDB from "@/config/db";
import Cart from "@/models/Cart";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Chuyển đổi items từ mảng [{ productId, quantity }] sang object { productId: quantity }
    const cartItems = cart.items.reduce((obj, item) => {
      obj[item.productId.toString()] = item.quantity;
      return obj;
    }, {});

    return NextResponse.json({ success: true, cartItems });
  } catch (error) {
    // console.error("Error fetching cart:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
