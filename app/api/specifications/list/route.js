import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Specification from "@/models/Specification";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    await connectDB();

    const { productIds } = await request.json();
    console.log("Received productIds in /api/specifications/list:", productIds);

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { success: false, message: "productIds must be an array" },
        { status: 400 }
      );
    }

    const validProductIds = productIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    if (validProductIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid productIds provided" },
        { status: 400 }
      );
    }

    const specifications = await Specification.find({
      productId: {
        $in: validProductIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    }).lean();

    console.log("Fetched specifications:", specifications);

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
    console.error("Fetch Specifications Error:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { success: false, message: "Failed to fetch specifications" },
      { status: 500 }
    );
  }
}
