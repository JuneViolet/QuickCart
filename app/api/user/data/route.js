import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ success: false, message: "User Not Found" });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
// import connectDB from "@/config/db";
// import User from "@/models/User";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     const { userId } = getAuth(request);
//     console.log("User ID from getAuth:", userId);
//     if (!userId) {
//       return NextResponse.json({ success: false, message: "Unauthorized" });
//     }

//     await connectDB();
//     const user = await User.findById(userId);
//     console.log("User found:", user); // Debug user từ MongoDB
//     if (!user) {
//       return NextResponse.json({ success: false, message: "User not found" });
//     }

//     return NextResponse.json({ success: true, user });
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     return NextResponse.json({ success: false, message: error.message });
//   }
// }
