import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/models/Product";

let searchConnection;

async function connectSearchDB() {
  if (searchConnection) {
    return searchConnection;
  }

  const opts = {
    bufferCommands: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  const uri = process.env.MONGODB_URI.includes("quickcart")
    ? process.env.MONGODB_URI
    : `${process.env.MONGODB_URI}/quickcart`;

  searchConnection = await mongoose.createConnection(uri, opts);
  console.log("Search connection created");
  return searchConnection;
}

export async function GET(request) {
  try {
    const conn = await connectSearchDB();
    const ProductModel = conn.model("Product", Product.schema); // Tạo model từ connection riêng

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!/[a-zA-Z0-9]/.test(query)) {
      return NextResponse.json([]);
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const results = await ProductModel.find({
      name: { $regex: escapedQuery, $options: "i" },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
