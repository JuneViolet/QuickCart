// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Attribute from "@/models/Attribute";

// export async function GET(request, { params }) {
//   try {
//     await connectDB();
//     const token = request.headers.get("authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { id } = params;
//     const attribute = await Attribute.findById(id);

//     if (!attribute) {
//       return NextResponse.json(
//         { success: false, message: "Thuộc tính không tồn tại" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true, attribute }, { status: 200 });
//   } catch (error) {
//     console.error("Get Attribute by ID Error:", error.message, error.stack);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch attribute: " + error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request, { params }) {
//   try {
//     await connectDB();
//     const token = request.headers.get("authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { id } = params;
//     const body = await request.json();
//     const { name, values } = body;

//     if (!name || !Array.isArray(values) || values.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid attribute data" },
//         { status: 400 }
//       );
//     }

//     const updatedAttribute = await Attribute.findByIdAndUpdate(
//       id,
//       { name, values },
//       { new: true, runValidators: true }
//     );

//     if (!updatedAttribute) {
//       return NextResponse.json(
//         { success: false, message: "Thuộc tính không tồn tại" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Cập nhật thuộc tính thành công",
//         attribute: updatedAttribute,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Update Attribute Error:", error.message, error.stack);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to update attribute: " + error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request, { params }) {
//   try {
//     await connectDB();
//     const token = request.headers.get("authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { id } = params;
//     const deletedAttribute = await Attribute.findByIdAndDelete(id);

//     if (!deletedAttribute) {
//       return NextResponse.json(
//         { success: false, message: "Thuộc tính không tồn tại" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { success: true, message: "Xóa thuộc tính thành công" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Delete Attribute Error:", error.message, error.stack);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to delete attribute: " + error.message,
//       },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Attribute from "@/models/Attribute";
import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";

export async function PUT(req, { params }) {
  await connectDB();

  const { id } = params;
  const { name, values } = await req.json();
  const { userId } = getAuth(req);

  if (!userId || !(await authSeller(userId))) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  if (!name || !Array.isArray(values)) {
    return NextResponse.json(
      { success: false, message: "Thiếu name hoặc values" },
      { status: 400 }
    );
  }

  try {
    let updated;

    if (name === "Màu sắc") {
      // validate { text, color }
      const invalid = values.some(
        (v) => typeof v !== "object" || !v.text || !v.color
      );
      if (invalid) {
        return NextResponse.json(
          { success: false, message: "Màu sắc phải có dạng { text, color }" },
          { status: 400 }
        );
      }

      updated = await Attribute.findByIdAndUpdate(
        id,
        { name, values },
        { new: true }
      );
    } else if (name === "Dung lượng") {
      // convert all to string
      const allStrings = values.map((v) => String(v));
      updated = await Attribute.findByIdAndUpdate(
        id,
        { name, values: allStrings },
        { new: true }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Loại thuộc tính không hợp lệ" },
        { status: 400 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy thuộc tính" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, attribute: updated });
  } catch (err) {
    console.error("PUT /api/attributes/:id error:", err);
    return NextResponse.json(
      { success: false, message: "Lỗi server" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { userId } = getAuth(req);
    if (!userId || !(await authSeller(userId))) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = params;
    const deleted = await Attribute.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy thuộc tính" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    console.error("DELETE /api/attributes/:id error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
