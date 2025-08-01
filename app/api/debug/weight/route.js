import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";

export async function POST(request) {
  try {
    await connectDB();

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Missing productId" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId).populate(
      "specifications"
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Logic tính trọng lượng như trong OrderSummary
    let weight = 50; // Mặc định 50g
    const weightSpec = product.specifications.find(
      (spec) => spec.key.toLowerCase() === "trọng lượng"
    );

    let debugInfo = {
      productName: product.name,
      originalWeight: weightSpec?.value || "Not found",
      defaultWeight: 50,
      calculatedWeight: weight,
      steps: [],
    };

    if (weightSpec) {
      const weightValue = weightSpec.value.toLowerCase().trim();
      debugInfo.steps.push(`Found weight spec: "${weightValue}"`);

      if (weightValue.includes("kg")) {
        // Nếu là kg, convert sang gram
        const kgValue = parseFloat(weightValue.replace(/[^0-9.]/g, ""));
        debugInfo.steps.push(`Extracted kg value: ${kgValue}`);
        if (!isNaN(kgValue)) {
          weight = Math.round(kgValue * 1000); // Convert kg to gram
          debugInfo.steps.push(`Converted to grams: ${weight}`);
        }
      } else if (weightValue.includes("g")) {
        // Nếu là gram
        const gValue = parseFloat(weightValue.replace(/[^0-9.]/g, ""));
        debugInfo.steps.push(`Extracted gram value: ${gValue}`);
        if (!isNaN(gValue)) {
          weight = Math.round(gValue);
          debugInfo.steps.push(`Rounded grams: ${weight}`);
        }
      } else {
        // Nếu chỉ là số, assume là gram
        const numValue = parseFloat(weightValue.replace(/[^0-9.]/g, ""));
        debugInfo.steps.push(`Extracted number value: ${numValue}`);
        if (!isNaN(numValue)) {
          weight = Math.round(numValue);
          debugInfo.steps.push(`Assumed grams, rounded: ${weight}`);
        }
      }
    } else {
      debugInfo.steps.push("No weight specification found, using default 50g");
    }

    debugInfo.calculatedWeight = weight;
    debugInfo.finalWeight = Math.max(weight, 50);

    return NextResponse.json({
      success: true,
      data: debugInfo,
    });
  } catch (error) {
    console.error("Weight debug error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
