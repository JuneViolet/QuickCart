import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const provinceCode = searchParams.get("province");

  if (!provinceCode) {
    return NextResponse.json(
      { success: false, message: "Province code is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
      {
        headers: {
          Token: process.env.GHN_TOKEN,
        },
        params: { province_id: provinceCode },
      }
    );
    const districts = response.data.data.map((district) => ({
      name: district.DistrictName,
      id: district.DistrictID,
    }));
    return NextResponse.json({ success: true, data: districts });
  } catch (error) {
    console.error("Error fetching districts from GHN:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch districts" },
      { status: 500 }
    );
  }
}
