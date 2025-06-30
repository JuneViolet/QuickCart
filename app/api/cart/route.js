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
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Variant from "@/models/Variants";
import Attribute from "@/models/Attribute";
import { getAuth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
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
    const cart = await Cart.findOne({ userId })
      .populate("items.productId")
      .populate({
        path: "items.variantId",
        select: "offerPrice price stock sku image attributeRefs",
        populate: {
          path: "attributeRefs.attributeId",
          model: "Attribute",
          select: "name values",
        },
      });
    console.log("Fetched Cart:", cart);

    if (!cart) {
      return NextResponse.json(
        { success: true, cartItems: {} },
        { status: 200 }
      );
    }

    const cartItems = cart.items.reduce((obj, item) => {
      if (item.productId && item.variantId) {
        const key = `${item.productId._id.toString()}_${item.variantId._id.toString()}`;
        obj[key] = {
          productId: item.productId._id.toString(),
          variantId: item.variantId._id.toString(),
          quantity: item.quantity,
          name: item.productId.name,
          price: item.variantId.offerPrice || item.productId.offerPrice || 0,
          image: item.productId.images[0] || item.variantId.image || "",
        };
      }
      return obj;
    }, {});

    return NextResponse.json({ success: true, cartItems });
  } catch (error) {
    console.error("Get Cart Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, variantId, quantity } = await request.json();
    if (!productId || !variantId || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.variantId.toString() === variantId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, variantId, quantity });
    }
    await cart.save();
    console.log("Cart updated:", cart.toJSON());

    const updatedCart = await Cart.findOne({ userId })
      .populate("items.productId")
      .populate("items.variantId");
    const cartItems = updatedCart.items.reduce((obj, item) => {
      if (item.productId && item.variantId) {
        const key = `${item.productId._id.toString()}_${item.variantId._id.toString()}`; // Key duy nhất
        obj[key] = {
          productId: item.productId._id.toString(),
          variantId: item.variantId._id.toString(),
          quantity: item.quantity,
          name: item.productId.name,
          price: item.variantId.offerPrice || item.productId.offerPrice,
          image: item.productId.images[0] || item.variantId.image || "",
        };
      }
      return obj;
    }, {});

    return NextResponse.json({ success: true, cartItems });
  } catch (error) {
    console.error("Error in POST /api/cart:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    console.log("PUT /api/cart called");
    const { userId } = getAuth(request);
    console.log("User ID from getAuth:", userId);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, variantId, quantity } = await request.json();
    console.log("Request body for PUT:", { productId, variantId, quantity });
    if (
      !productId ||
      !variantId ||
      quantity === undefined ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(variantId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid productId, variantId, or quantity",
        },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("Connected to DB for PUT");

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.variantId.toString() === variantId
    );
    if (quantity === 0 && itemIndex > -1) {
      cart.items.splice(itemIndex, 1); // Remove item if quantity is 0
    } else if (itemIndex > -1) {
      cart.items[itemIndex].quantity = Math.max(1, quantity); // Update quantity
    } else if (quantity > 0) {
      return NextResponse.json(
        { success: false, message: "Product not in cart, use POST to add" },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid quantity operation" },
        { status: 400 }
      );
    }

    cart.updatedAt = new Date();
    cart.markModified("items");
    await cart.save();
    console.log("Cart after save:", cart.toJSON());

    const updatedCart = await Cart.findOne({ userId })
      .populate("items.productId")
      .populate({
        path: "items.variantId",
        select: "offerPrice price stock image attributeRefs",
        populate: {
          path: "attributeRefs.attributeId",
          model: "Attribute",
          select: "name values",
        },
      });
    const cartItems = updatedCart.items.reduce((obj, item) => {
      if (item.productId && item.variantId) {
        const key = `${item.productId._id.toString()}_${item.variantId._id.toString()}`;
        obj[key] = {
          productId: item.productId._id.toString(),
          variantId: item.variantId._id.toString(),
          quantity: item.quantity,
          name: item.productId.name,
          price: item.variantId.offerPrice || item.productId.offerPrice || 0,
          image: item.productId.images[0] || item.variantId.image || "",
        };
      }
      return obj;
    }, {});

    return NextResponse.json({ success: true, cartItems });
  } catch (error) {
    console.error("Error in PUT /api/cart:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
