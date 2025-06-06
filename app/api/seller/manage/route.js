// import connectDB from "@/config/db";
// import Category from "@/models/Category";
// import Brand from "@/models/Brand";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import authSeller from "@/lib/authSeller"; // Import authSeller

// // GET - Lấy danh sách loại hoặc hãng
// export async function GET(req) {
//   try {
//     await connectDB();
//     const { userId } = getAuth(req);

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     const isSeller = await authSeller(userId);
//     if (!isSeller) {
//       return NextResponse.json(
//         { success: false, message: "Not authorized" },
//         { status: 403 }
//       );
//     }

//     const { searchParams } = new URL(req.url);
//     const type = searchParams.get("type");

//     let items;
//     if (type === "categories") {
//       items = await Category.find();
//     } else if (type === "brands") {
//       items = await Brand.find();
//     } else {
//       return NextResponse.json(
//         { success: false, message: "Invalid type" },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json({ success: true, items });
//   } catch (error) {
//     console.error("GET Error:", error);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }

// // POST - Tạo mới loại hoặc hãng
// export async function POST(req) {
//   try {
//     await connectDB();
//     const { userId } = getAuth(req);

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     const isSeller = await authSeller(userId);
//     if (!isSeller) {
//       return NextResponse.json(
//         { success: false, message: "Not authorized" },
//         { status: 403 }
//       );
//     }

//     const { type, name, description } = await req.json();
//     console.log("POST request data:", { type, name, description }); // Log để kiểm tra

//     if (!type || !name) {
//       return NextResponse.json(
//         { success: false, message: "Type and name are required" },
//         { status: 400 }
//       );
//     }

//     let item;
//     if (type === "category") {
//       const existing = await Category.findOne({ name });
//       if (existing) {
//         return NextResponse.json(
//           { success: false, message: "Category already exists" },
//           { status: 400 }
//         );
//       }
//       item = await Category.create({ name, description });
//     } else if (type === "brand") {
//       const existing = await Brand.findOne({ name });
//       if (existing) {
//         return NextResponse.json(
//           { success: false, message: "Brand already exists" },
//           { status: 400 }
//         );
//       }
//       item = await Brand.create({ name, description });
//     } else {
//       return NextResponse.json(
//         { success: false, message: "Invalid type" },
//         { status: 400 }
//       );
//     }

//     console.log("Saved item:", item); // Log để kiểm tra dữ liệu lưu
//     return NextResponse.json({
//       success: true,
//       message: `Added ${type} successfully`,
//       item,
//     });
//   } catch (error) {
//     console.error("POST Error:", error);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }

// // PUT - Cập nhật loại hoặc hãng
// export async function PUT(req) {
//   try {
//     await connectDB();
//     const { userId } = getAuth(req);

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     const isSeller = await authSeller(userId);
//     if (!isSeller) {
//       return NextResponse.json(
//         { success: false, message: "Not authorized" },
//         { status: 403 }
//       );
//     }

//     const { _id, type, name, description } = await req.json();
//     console.log("PUT request data:", { _id, type, name, description });

//     if (!type || !name || !_id) {
//       return NextResponse.json(
//         { success: false, message: "Type, name, and ID are required" },
//         { status: 400 }
//       );
//     }

//     let item;
//     if (type === "category") {
//       const existing = await Category.findOne({ name, _id: { $ne: _id } });
//       if (existing) {
//         return NextResponse.json(
//           { success: false, message: "Category already exists" },
//           { status: 400 }
//         );
//       }
//       item = await Category.findByIdAndUpdate(
//         _id,
//         { name, description },
//         { new: true, runValidators: true }
//       );
//     } else if (type === "brand") {
//       const existing = await Brand.findOne({ name, _id: { $ne: _id } });
//       if (existing) {
//         return NextResponse.json(
//           { success: false, message: "Brand already exists" },
//           { status: 400 }
//         );
//       }
//       item = await Brand.findByIdAndUpdate(
//         _id,
//         { name, description },
//         { new: true, runValidators: true }
//       );
//     } else {
//       return NextResponse.json(
//         { success: false, message: "Invalid type" },
//         { status: 400 }
//       );
//     }

//     if (!item) {
//       return NextResponse.json(
//         { success: false, message: "Item not found" },
//         { status: 404 }
//       );
//     }

//     console.log("Updated item:", item); // Log dữ liệu sau khi cập nhật
//     return NextResponse.json({
//       success: true,
//       message: `Updated ${type} successfully`,
//       item,
//     });
//   } catch (error) {
//     console.error("PUT Error:", error);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }

// // DELETE - Xóa loại hoặc hãng
// export async function DELETE(req) {
//   try {
//     await connectDB();
//     const { userId } = getAuth(req);

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     const isSeller = await authSeller(userId);
//     if (!isSeller) {
//       return NextResponse.json(
//         { success: false, message: "Not authorized" },
//         { status: 403 }
//       );
//     }

//     const { id, type } = await req.json();
//     if (!id || !type) {
//       return NextResponse.json(
//         { success: false, message: "ID and type are required" },
//         { status: 400 }
//       );
//     }

//     let result;
//     if (type === "category") {
//       result = await Category.findByIdAndDelete(id);
//     } else if (type === "brand") {
//       result = await Brand.findByIdAndDelete(id);
//     } else {
//       return NextResponse.json(
//         { success: false, message: "Invalid type" },
//         { status: 400 }
//       );
//     }

//     if (!result) {
//       return NextResponse.json(
//         { success: false, message: "Item not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: `Deleted ${type} successfully`,
//     });
//   } catch (error) {
//     console.error("DELETE Error:", error);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
// api/seller/manage
import connectDB from "@/config/db";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import BrandCategory from "@/models/BrandCategory";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authSeller from "@/lib/authSeller";

// GET - Lấy danh sách loại hoặc hãng
export async function GET(req) {
  try {
    await connectDB();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let items;
    if (type === "categories") {
      items = await Category.find().lean(); // Sử dụng lean() để trả về plain object
    } else if (type === "brands") {
      const brands = await Brand.find().lean(); // Sử dụng lean() để trả về plain object
      items = [];
      for (let brand of brands) {
        const brandCategories = await BrandCategory.find({
          brandId: brand._id,
        }).populate("categoryId");
        const categories = brandCategories
          .map((bc) => {
            if (bc.categoryId) {
              // Đảm bảo categoryId tồn tại
              const cat = bc.categoryId.toObject
                ? bc.categoryId.toObject()
                : bc.categoryId;
              return {
                _id: cat._id,
                name: cat.name,
                description: cat.description,
                createdAt: cat.createdAt,
              };
            }
            return null;
          })
          .filter((cat) => cat !== null); // Loại bỏ các giá trị null
        items.push({
          ...brand,
          categories,
        });
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid type" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Tạo mới loại hoặc hãng
export async function POST(req) {
  try {
    await connectDB();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const { type, name, description, categoryIds } = await req.json();
    console.log("POST request data:", { type, name, description, categoryIds });

    if (!type || !name) {
      return NextResponse.json(
        { success: false, message: "Type and name are required" },
        { status: 400 }
      );
    }

    let item;
    if (type === "category") {
      const existing = await Category.findOne({ name });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Category already exists" },
          { status: 400 }
        );
      }
      item = await Category.create({ name, description });
    } else if (type === "brand") {
      const existing = await Brand.findOne({ name });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Brand already exists" },
          { status: 400 }
        );
      }
      item = await Brand.create({ name, description });
      if (categoryIds && categoryIds.length > 0) {
        await BrandCategory.insertMany(
          categoryIds.map((categoryId) => ({ brandId: item._id, categoryId }))
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid type" },
        { status: 400 }
      );
    }

    console.log("Saved item:", item);
    return NextResponse.json({
      success: true,
      message: `Added ${type} successfully`,
      item,
    });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật loại hoặc hãng
export async function PUT(req) {
  try {
    await connectDB();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const { _id, type, name, description, categoryIds } = await req.json();
    console.log("PUT request data:", {
      _id,
      type,
      name,
      description,
      categoryIds,
    });

    if (!type || !name || !_id) {
      return NextResponse.json(
        { success: false, message: "Type, name, and ID are required" },
        { status: 400 }
      );
    }

    let item;
    if (type === "category") {
      const existing = await Category.findOne({ name, _id: { $ne: _id } });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Category already exists" },
          { status: 400 }
        );
      }
      item = await Category.findByIdAndUpdate(
        _id,
        { name, description },
        { new: true, runValidators: true }
      );
    } else if (type === "brand") {
      const existing = await Brand.findOne({ name, _id: { $ne: _id } });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Brand already exists" },
          { status: 400 }
        );
      }
      const brand = await Brand.findById(_id);
      if (!brand) {
        return NextResponse.json(
          { success: false, message: "Brand not found" },
          { status: 404 }
        );
      }

      // Cập nhật quan hệ
      await BrandCategory.deleteMany({ brandId: _id });
      if (categoryIds && categoryIds.length > 0) {
        await BrandCategory.insertMany(
          categoryIds.map((categoryId) => ({ brandId: _id, categoryId }))
        );
      }

      item = await Brand.findByIdAndUpdate(
        _id,
        { name, description },
        { new: true, runValidators: true }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid type" },
        { status: 400 }
      );
    }

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Item not found" },
        { status: 404 }
      );
    }

    console.log("Updated item:", item);
    return NextResponse.json({
      success: true,
      message: `Updated ${type} successfully`,
      item,
    });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Xóa loại hoặc hãng
export async function DELETE(req) {
  try {
    await connectDB();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const { id, type } = await req.json();
    if (!id || !type) {
      return NextResponse.json(
        { success: false, message: "ID and type are required" },
        { status: 400 }
      );
    }

    let result;
    if (type === "category") {
      result = await Category.findByIdAndDelete(id);
      if (result) {
        await BrandCategory.deleteMany({ categoryId: id });
      }
    } else if (type === "brand") {
      result = await Brand.findByIdAndDelete(id);
      if (result) {
        await BrandCategory.deleteMany({ brandId: id });
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid type" },
        { status: 400 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${type} successfully`,
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
