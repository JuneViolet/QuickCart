// api/specifications/list/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db"; // Quay lại sử dụng connectDB
import Specification from "@/models/Specification";

export async function POST(request) {
  try {
    await connectDB(); // Quay lại connectDB

    const { productIds } = await request.json();

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { success: false, message: "productIds must be an array" },
        { status: 400 }
      );
    }

    const specifications = await Specification.find({
      productId: { $in: productIds },
    }).lean();

    const groupedSpecs = specifications.reduce((acc, spec) => {
      if (!acc[spec.productId]) {
        acc[spec.productId] = { productId: spec.productId, specs: [] };
      }
      acc[spec.productId].specs.push({ key: spec.key, value: spec.value });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      specifications: Object.values(groupedSpecs),
    });
  } catch (error) {
    console.error("Fetch Specifications Error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch specifications" },
      { status: 500 }
    );
  }
}
