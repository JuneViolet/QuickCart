import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";

export const GET = async () => {
  try {
    await connectDB();

    const aggregation = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = aggregation.map((item) => ({
      status: item._id,
      count: item.count,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};
