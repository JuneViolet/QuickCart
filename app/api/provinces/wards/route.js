import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get("district");

  if (!districtId) {
    return NextResponse.json(
      { success: false, message: "District ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
      {
        headers: {
          Token: process.env.GHN_TOKEN,
        },
        params: { district_id: districtId },
      }
    );
    const wards = response.data.data.map((ward) => ({
      name: ward.WardName,
      code: ward.WardCode,
    }));
    return NextResponse.json({ success: true, data: wards });
  } catch (error) {
    console.error("Error fetching wards from GHN:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch wards" },
      { status: 500 }
    );
  }
}
