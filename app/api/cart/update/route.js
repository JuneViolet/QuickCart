// import connectDB from "@/config/db";
// import User from "@/models/User";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   try {
//     const { userId } = getAuth(request);
//     if (!userId) {
//       return NextResponse.json({ success: false, message: "Unauthorized" });
//     }

//     const { cartData } = await request.json();
//     if (!cartData || typeof cartData !== "object") {
//       return NextResponse.json({
//         success: false,
//         message: "Invalid cart data",
//       });
//     }

//     await connectDB();
//     const user = await User.findById(userId);
//     if (!user) {
//       return NextResponse.json({ success: false, message: "User not found" });
//     }

//     user.cartItems = cartData; // Đổi từ cartItem thành cartItems
//     await user.save();

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error updating cart:", error);
//     return NextResponse.json({ success: false, message: error.message });
//   }
// }
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    console.log("GET /api/cart/update called"); // Log 1
    const { userId } = getAuth(request);
    console.log("User ID from getAuth:", userId); // Log 2
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    console.log("Connected to DB for GET"); // Log 3

    let cart = await Cart.findOne({ userId });
    console.log("Cart found:", cart ? cart.toJSON() : null); // Log 4
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
      console.log("New cart created:", cart.toJSON()); // Log 5
    }

    const cartItems = cart.items.reduce((obj, item) => {
      obj[item.productId.toString()] = item.quantity;
      return obj;
    }, {});

    return NextResponse.json({ success: true, cartItems });
  } catch (error) {
    console.error("Error in GET /api/cart/update:", error.message); // Log 6
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log("POST /api/cart/update called"); // Log 1
    const { userId } = getAuth(request);
    console.log("User ID from getAuth:", userId); // Log 2
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Request body:", body); // Log 3
    const { cartData } = body;
    if (!cartData || typeof cartData !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid cart data" },
        { status: 400 }
      );
    }

    console.log("Received cartData:", cartData); // Log 4

    await connectDB();
    console.log("Connected to DB for POST"); // Log 5

    let cart = await Cart.findOne({ userId });
    console.log("Cart before update:", cart ? cart.toJSON() : null); // Log 10

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
      console.log("New cart created:", cart.toJSON()); // Log 11
    }

    // Nếu cartData rỗng, xóa toàn bộ giỏ hàng
    if (Object.keys(cartData).length === 0) {
      cart.items = [];
      cart.updatedAt = new Date();
      await cart.save();
      console.log("Cart after save (cleared):", cart.toJSON());
      return NextResponse.json({ success: true, cart: {} });
    }

    // Xử lý bình thường nếu cartData không rỗng
    const items = await Promise.all(
      Object.entries(cartData)
        .filter(([_, quantity]) => quantity > 0)
        .map(async ([productId, quantity]) => {
          try {
            console.log("Processing productId:", productId); // Log 6
            if (!mongoose.Types.ObjectId.isValid(productId)) {
              throw new Error(`Invalid ObjectId: ${productId}`);
            }
            const productExists = await Product.findById(productId).lean();
            console.log("Product exists:", productId, productExists); // Log 7
            if (!productExists) {
              throw new Error(`Product not found: ${productId}`);
            }
            return {
              productId: new mongoose.Types.ObjectId(productId),
              quantity: Number(quantity),
            };
          } catch (error) {
            console.error(`Error with productId ${productId}:`, error.message); // Log 8
            return null;
          }
        })
    ).then((items) => items.filter((item) => item !== null));

    console.log("Items to save:", items); // Log 9

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid items to update" },
        { status: 400 }
      );
    }

    cart.items = items;
    cart.updatedAt = new Date();
    cart.markModified("items");
    await cart.save();
    console.log("Cart after save:", cart.toJSON()); // Log 12

    const cartItems = cart.items.reduce((obj, item) => {
      obj[item.productId.toString()] = item.quantity;
      return obj;
    }, {});

    return NextResponse.json({ success: true, cart: cartItems });
  } catch (error) {
    console.error("Error in POST /api/cart/update:", error.message); // Log 13
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
