// import connectDB from "@/config/db";
// import User from "@/models/User";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   try {
//     const { userId } = getAuth(request);

//     const { cartData } = await request.json();

//     await connectDB();

//     const user = await User.findById(userId);

//     user.cartItem = cartData;
//     await user.save();

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: error.message });
//   }
// }
import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { cartData } = await request.json();
    if (!cartData || typeof cartData !== "object") {
      return NextResponse.json({
        success: false,
        message: "Invalid cart data",
      });
    }

    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    user.cartItems = cartData; // Đổi từ cartItem thành cartItems
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
