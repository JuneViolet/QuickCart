// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Product from "@/models/Product";

// export async function GET(request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(request.url);
//     const query = searchParams.get("query");

//     if (!query) {
//       return NextResponse.json({ error: "Query is required" }, { status: 400 });
//     }

//     if (!/[a-zA-Z0-9]/.test(query)) {
//       return NextResponse.json([]);
//     }

//     const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//     const results = await Product.find({
//       name: { $regex: escapedQuery, $options: "i" },
//     });

//     console.log("Search results:", results); // Log để debug
//     return NextResponse.json(results);
//   } catch (error) {
//     console.error("Error in search API:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    if (!/[a-zA-Z0-9]/.test(query)) {
      return NextResponse.json({ success: true, products: [] });
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const results = await Product.find({
      name: { $regex: escapedQuery, $options: "i" },
    }).select("name images image"); // Chỉ lấy các trường cần thiết

    console.log("Search results:", results); // Log để debug
    return NextResponse.json({ success: true, products: results });
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
