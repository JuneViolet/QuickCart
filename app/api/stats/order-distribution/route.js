// //api/stats/order-distribution
// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Order from "@/models/Order";

// export const GET = async () => {
//   try {
//     await connectDB();

//     const aggregation = await Order.aggregate([
//       {
//         $match: {
//           status: {
//             $nin: ["canceled", "ghn_failed"], // Loại bỏ trạng thái không hợp lệ
//           },
//         },
//       },
//       { $group: { _id: "$status", count: { $sum: 1 } } },
//     ]);

//     const result = aggregation.map((item) => ({
//       status: item._id,
//       count: item.count,
//     }));

//     return NextResponse.json(result);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server Error" }, { status: 500 });
//   }
// };
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";

export const GET = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const matchQuery = {
      status: { $nin: ["canceled", "ghn_failed"] },
    };

    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    const aggregation = await Order.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Đảm bảo luôn trả về mảng
    const result =
      aggregation.length > 0
        ? aggregation.map((item) => ({
            status: item._id,
            count: item.count,
          }))
        : [];

    console.log("Order Distribution Result:", result); // Debug
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};
