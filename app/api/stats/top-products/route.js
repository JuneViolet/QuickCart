// // app/api/stats/top-products/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const GET = async (request) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit")) || 10;

    // Tạo filter cho đơn hàng
    const orderFilter = {
      status: { $in: ["paid", "shipped", "delivered"] },
    };

    // Filter theo thời gian
    if (startDate && endDate) {
      orderFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    const orders = await Order.find(orderFilter)
      .populate("items.product")
      .populate("items.variantId");

    console.log("Debug Top Products API:");
    console.log("- Order filter:", orderFilter);
    console.log("- Found orders:", orders.length);
    console.log("- Category filter:", category);
    console.log("- Date range:", startDate, "to", endDate);

    const productStats = {};

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product;
        if (!product) continue;

        // Populate category name
        const populatedProduct = await Product.findById(product._id).populate(
          "category"
        );
        const categoryName =
          populatedProduct?.category?.name || product.category;

        // Filter theo danh mục nếu có
        if (category && categoryName !== category) continue;

        const productId = product._id.toString();
        const variant = item.variantId;
        const revenue =
          (variant?.offerPrice || variant?.price || item.price || 0) *
          item.quantity;

        if (!productStats[productId]) {
          productStats[productId] = {
            productId,
            name: product.name,
            category: categoryName,
            totalSold: 0,
            totalRevenue: 0,
            image: product.images?.[0] || "",
          };
        }

        productStats[productId].totalSold += item.quantity;
        productStats[productId].totalRevenue += revenue;
      }
    }

    // Sắp xếp và trả về top sản phẩm
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);

    console.log("- Total products found:", Object.keys(productStats).length);
    console.log("- Top products:", topProducts.length);
    if (topProducts.length > 0) {
      console.log("- Sample top product:", topProducts[0]);
    }

    return NextResponse.json(topProducts);
  } catch (err) {
    console.error("Top product stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
