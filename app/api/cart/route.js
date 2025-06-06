// // app/api/cart/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Cart from "@/models/Cart";
// import Product from "@/models/Product";
// import { getAuth } from "@clerk/nextjs/server";

// export async function GET(request) {
//   try {
//     console.log("GET /api/cart called");
//     const { userId } = getAuth(request);
//     console.log("User ID from getAuth:", userId);
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     await connectDB();
//     console.log("Connected to DB for GET");

//     let cart = await Cart.findOne({ userId }).populate("items.productId");
//     console.log("Cart found:", cart ? cart.toJSON() : null);
//     if (!cart) {
//       cart = await Cart.create({ userId, items: [] });
//       console.log("New cart created:", cart.toJSON());
//     }

//     const cartItems = cart.items.reduce((obj, item) => {
//       if (item.productId) {
//         obj[item.productId._id.toString()] = {
//           quantity: item.quantity,
//           name: item.productId.name,
//           price: item.productId.price,
//           image: item.productId.images[0], // Lấy ảnh đầu tiên
//         };
//       }
//       return obj;
//     }, {});

//     return NextResponse.json({ success: true, cartItems });
//   } catch (error) {
//     console.error("Error in GET /api/cart:", error.message);
//     return NextResponse.json(
//       { success: false, message: "Server error: " + error.message },
//       { status: 500 }
//     );
//   }
// }
// app/api/cart/route.js
// app/api/cart/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db"; // Quay lại sử dụng connectDB
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    console.log("GET /api/cart called");
    const { userId } = getAuth(request);
    console.log("User ID from getAuth:", userId);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB(); // Quay lại connectDB
    console.log("Connected to DB for GET");

    let cart = await Cart.findOne({ userId }).populate("items.productId");
    console.log("Cart found:", cart ? cart.toJSON() : null);
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
      console.log("New cart created:", cart.toJSON());
    }

    const cartItems = cart.items.reduce((obj, item) => {
      if (item.productId) {
        obj[item.productId._id.toString()] = {
          quantity: item.quantity,
          name: item.productId.name,
          price: item.productId.offerPrice,
          image: item.productId.images[0], // Lấy ảnh đầu tiên
        };
      }
      return obj;
    }, {});

    return NextResponse.json({ success: true, cartItems });
  } catch (error) {
    console.error("Error in GET /api/cart:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
