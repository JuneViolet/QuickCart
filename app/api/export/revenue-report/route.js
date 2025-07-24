import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { Workbook } from "exceljs";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query = {
      status: { $in: ["paid", "shipped"] }, // Thêm "delivered" nếu có
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    const orders = await Order.find(query)
      .populate("items.product")
      .populate("items.variantId");

    // Tổng hợp dữ liệu
    const categoryStats = {};
    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product;
        const variant = item.variantId;

        if (!product || !product.category) continue;

        const populatedProduct = await Product.findById(product._id).populate(
          "category"
        );
        const categoryName = populatedProduct?.category?.name;
        if (!categoryName) continue;

        const quantity = item.quantity;
        const price = variant?.price ?? 0;
        const totalPrice = price * quantity;

        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = {
            totalSold: 0,
            totalRevenue: 0,
          };
        }
        categoryStats[categoryName].totalSold += quantity;
        categoryStats[categoryName].totalRevenue += totalPrice;
      }
    }

    // Tạo workbook và worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Revenue Report");

    // Thiết lập style
    const headerStyle = {
      font: { name: "Calibri", size: 12, bold: true },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F81BD" },
      },
      alignment: { vertical: "middle", horizontal: "center" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const cellStyle = {
      font: { name: "Calibri", size: 11 },
      alignment: { vertical: "middle", horizontal: "left" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    };

    // Thêm tiêu đề
    worksheet.mergeCells("A1:C1");
    worksheet.getCell("A1").value = "BÁO CÁO DOANH THU";
    worksheet.getCell("A1").font = { name: "Calibri", size: 16, bold: true };
    worksheet.getCell("A1").alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3E0F7" },
    };

    // Thêm khoảng thời gian
    worksheet.mergeCells("A2:C2");
    worksheet.getCell("A2").value = `Thời gian: ${new Date(
      startDate
    ).toLocaleDateString("vi-VN")} - ${new Date(endDate).toLocaleDateString(
      "vi-VN"
    )}`;
    worksheet.getCell("A2").font = { name: "Calibri", size: 12, italic: true };
    worksheet.getCell("A2").alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // Thêm header bảng
    const headers = ["Loại sản phẩm", "Số lượng bán", "Doanh thu (VND)"];
    worksheet.addRow(headers);
    worksheet.getRow(3).eachCell((cell) => {
      Object.assign(cell, headerStyle);
    });

    // Thêm dữ liệu
    Object.entries(categoryStats).forEach(([category, stats], index) => {
      worksheet.addRow([
        category,
        stats.totalSold,
        stats.totalRevenue
          .toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
          })
          .replace(/₫/g, "")
          .trim(),
      ]);
      worksheet.getRow(index + 4).eachCell((cell) => {
        Object.assign(cell, cellStyle);
      });
    });

    // Thêm tổng hợp (tùy chọn)
    const totalRow = worksheet.addRow([
      "Tổng cộng",
      Object.values(categoryStats).reduce(
        (sum, item) => sum + item.totalSold,
        0
      ),
      Object.values(categoryStats)
        .reduce((sum, item) => sum + item.totalRevenue, 0)
        .toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        })
        .replace(/₫/g, "")
        .trim(),
    ]);
    totalRow.eachCell((cell) => {
      Object.assign(cell, {
        ...cellStyle,
        font: { ...cellStyle.font, bold: true },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFEB9C" },
        },
      });
    });

    // Điều chỉnh độ rộng cột
    worksheet.columns = [
      { header: "Loại sản phẩm", key: "category", width: 30 },
      { header: "Số lượng bán", key: "totalSold", width: 15 },
      { header: "Doanh thu (VND)", key: "totalRevenue", width: 20 },
    ];

    // Tạo buffer và trả về file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `revenue_report_${startDate}_to_${endDate}.xlsx`;
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
