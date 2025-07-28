// app/api/cart/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Variant from "@/models/Variants";
import Attribute from "@/models/Attribute";
import { getAuth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

// Helper function to get updated cart items
async function getUpdatedCartItems(userId) {
  const updatedCart = await Cart.findOne({ userId })
    .populate("items.productId")
    .populate("items.variantId");

  return updatedCart.items.reduce((obj, item) => {
    if (item.productId && item.variantId) {
      const key = `${item.productId._id.toString()}_${item.variantId._id.toString()}`;
      obj[key] = {
        productId: item.productId._id.toString(),
        variantId: item.variantId._id.toString(),
        quantity: item.quantity,
        name: item.productId.name,
        price: item.variantId.offerPrice || item.productId.offerPrice,
        image:
          (item.variantId.images && item.variantId.images[0]) ||
          item.productId.images[0] ||
          "",
      };
    }
    return obj;
  }, {});
}

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
        select: "offerPrice price stock sku images attributeRefs",
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
          image:
            (item.variantId.images && item.variantId.images[0]) ||
            item.productId.images[0] ||
            "",
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

    // Kiểm tra tồn kho trước khi thêm vào giỏ hàng
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    const variant = await Variant.findById(variantId);
    if (!variant) {
      return NextResponse.json(
        { success: false, message: "Phiên bản sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    if (variant.stock <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Sản phẩm đã hết hàng! Vui lòng chọn sản phẩm khác.",
        },
        { status: 400 }
      );
    }

    let warningMessage = null;
    if (quantity > variant.stock) {
      warningMessage = `⚠️ Bạn đang đặt ${quantity} sản phẩm nhưng kho chỉ còn ${variant.stock}. Đơn hàng sẽ được xử lý theo thứ tự và có thể cần thời gian chờ bổ sung hàng.`;
    }

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
      const newTotalQuantity = cart.items[itemIndex].quantity + quantity;
      if (newTotalQuantity > variant.stock) {
        const availableQuantity =
          variant.stock - cart.items[itemIndex].quantity;
        if (availableQuantity > 0) {
          cart.items[itemIndex].quantity = variant.stock;
          return NextResponse.json(
            {
              success: true,
              warning: true,
              message: `Chỉ có thể thêm ${availableQuantity} sản phẩm nữa. Đã cập nhật giỏ hàng với số lượng tối đa (${variant.stock}).`,
              cartItems: await getUpdatedCartItems(userId),
            },
            { status: 200 }
          );
        } else {
          return NextResponse.json(
            {
              success: false,
              message: `Không thể thêm thêm sản phẩm. Giỏ hàng đã có tối đa ${cart.items[itemIndex].quantity}/${variant.stock} sản phẩm.`,
            },
            { status: 400 }
          );
        }
      }
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, variantId, quantity });
    }
    await cart.save();

    const updatedCart = await Cart.findOne({ userId })
      .populate("items.productId")
      .populate("items.variantId");
    const cartItems = updatedCart.items.reduce((obj, item) => {
      if (item.productId && item.variantId) {
        const key = `${item.productId._id.toString()}_${item.variantId._id.toString()}`;
        obj[key] = {
          productId: item.productId._id.toString(),
          variantId: item.variantId._id.toString(),
          quantity: item.quantity,
          name: item.productId.name,
          price: item.variantId.offerPrice || item.productId.offerPrice,
          image:
            (item.variantId.images && item.variantId.images[0]) ||
            item.productId.images[0] ||
            "",
        };
      }
      return obj;
    }, {});

    const response = { success: true, cartItems };
    if (warningMessage) {
      response.warning = true;
      response.message = warningMessage;
    }

    return NextResponse.json(response);
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
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, variantId, quantity } = await request.json();
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
      cart.items.splice(itemIndex, 1);
    } else if (itemIndex > -1) {
      cart.items[itemIndex].quantity = Math.max(1, quantity);
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

    const updatedCart = await Cart.findOne({ userId })
      .populate("items.productId")
      .populate({
        path: "items.variantId",
        select: "offerPrice price stock images attributeRefs",
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
          image:
            (item.variantId.images && item.variantId.images[0]) ||
            item.productId.images[0] ||
            "",
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
