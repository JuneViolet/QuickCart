// import connectDB from "@/config/db";
// import Address from "@/models/Address";
// import Order from "@/models/Order";
// import Product from "@/models/Product";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);
//     await connectDB();

//     Address.length;
//     Product.length;

//     const orders = await Order.find({ userId }).populate(
//       "address items.product"
//     ); // không được thì thêm s

//     return NextResponse.json({ success: true, orders });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: error.message });
//   }
// }
import connectDB from "@/config/db";
import Order from "@/models/Order";
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

    const orders = await Order.find({ userId }).populate(
      "address items.product items.variantId"
    );
    console.log(
      "Populated Orders:",
      orders.map((o) =>
        o.items.map((i) => ({
          product: i.product?.name,
          variantId: i.variantId ? i.variantId._id : null,
          attributeRefs: i.variantId ? i.variantId.attributeRefs : null,
        }))
      )
    ); // Log để debug

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error in /api/order/list:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
