import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import { Workbook } from "exceljs";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const matchQuery = {
      // Sử dụng cùng trạng thái với API category để đồng bộ
      status: { $in: ["paid", "shipped", "delivered"] },
    };

    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    console.log("Export API - Match query:", matchQuery);

    // Pipeline để lấy dữ liệu chi tiết theo sản phẩm
    const detailPipeline = [
      { $match: matchQuery },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "categories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $lookup: {
          from: "variants",
          localField: "items.variantId",
          foreignField: "_id",
          as: "variantDetails",
        },
      },
      { $unwind: "$variantDetails" },
      {
        $group: {
          _id: {
            categoryName: "$categoryDetails.name",
            productName: "$productDetails.name",
            productId: "$productDetails._id",
          },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: [
                "$items.quantity",
                {
                  $ifNull: [
                    "$variantDetails.offerPrice",
                    "$variantDetails.price",
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
      {
        $project: {
          categoryName: "$_id.categoryName",
          productName: "$_id.productName",
          productId: "$_id.productId",
          totalSold: 1,
          totalRevenue: 1,
          _id: 0,
        },
      },
      { $sort: { categoryName: 1, totalRevenue: -1 } }, // Sắp xếp theo danh mục, rồi theo doanh thu
    ];

    const productDetails = await Order.aggregate(detailPipeline);

    console.log(
      "Export API - Product details:",
      productDetails.length,
      "products"
    );
    console.log("Export API - Sample product:", productDetails[0]);

    // Nhóm dữ liệu theo category để tạo cấu trúc phân cấp
    const groupedData = {};
    let grandTotalProducts = 0;
    let grandTotalRevenue = 0;

    productDetails.forEach((product) => {
      const category = product.categoryName;
      if (!groupedData[category]) {
        groupedData[category] = {
          products: [],
          categoryTotal: { totalSold: 0, totalRevenue: 0 },
        };
      }

      groupedData[category].products.push(product);
      groupedData[category].categoryTotal.totalSold += product.totalSold;
      groupedData[category].categoryTotal.totalRevenue += product.totalRevenue;

      grandTotalProducts += product.totalSold;
      grandTotalRevenue += product.totalRevenue;
    });

    console.log(
      "Export API - Grouped categories:",
      Object.keys(groupedData).length
    );
    console.log("Export API - Total products sold:", grandTotalProducts);

    // Tạo workbook và worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Revenue Report");

    // Thiết lập style
    const headerStyle = {
      font: {
        name: "Calibri",
        size: 12,
        bold: true,
        color: { argb: "FFFFFFFF" },
      },
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
    worksheet.getCell("A1").value = "BÁO CÁO DOANH THU THEO DANH MỤC";
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

    // Thêm thông tin thống kê tổng quan
    worksheet.mergeCells("A3:C3");
    worksheet.getCell(
      "A3"
    ).value = `Tổng sản phẩm đã bán: ${grandTotalProducts} | Tổng doanh thu: ${grandTotalRevenue.toLocaleString(
      "vi-VN",
      {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }
    )}`;
    worksheet.getCell("A3").font = { name: "Calibri", size: 11, bold: true };
    worksheet.getCell("A3").alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // Để trống 1 dòng
    worksheet.addRow([]);

    // Thêm header bảng
    const headers = ["Danh mục / Sản phẩm", "Số lượng bán", "Doanh thu (VND)"];
    worksheet.addRow(headers);
    const headerRowIndex = worksheet.lastRow.number;
    worksheet.getRow(headerRowIndex).eachCell((cell) => {
      Object.assign(cell, headerStyle);
    });

    // Thêm dữ liệu chi tiết theo danh mục
    let currentRowIndex = headerRowIndex + 1;

    Object.keys(groupedData)
      .sort()
      .forEach((categoryName) => {
        const categoryData = groupedData[categoryName];

        // Thêm tên danh mục (header của danh mục)
        const categoryRow = worksheet.addRow([
          ` ${categoryName.toUpperCase()}`,
          "",
          "",
        ]);
        categoryRow.eachCell((cell) => {
          Object.assign(cell, {
            ...cellStyle,
            font: { ...cellStyle.font, bold: true, size: 12 },
            fill: {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFE6F3FF" },
            },
          });
        });
        currentRowIndex++;

        // Thêm từng sản phẩm trong danh mục
        categoryData.products.forEach((product) => {
          const productRow = worksheet.addRow([
            `     ${product.productName}`,
            product.totalSold,
            product.totalRevenue,
          ]);
          productRow.eachCell((cell, colNumber) => {
            Object.assign(cell, cellStyle);
            if (colNumber === 3) {
              // Cột doanh thu
              cell.numFmt = '#,##0"₫"';
            }
          });
          currentRowIndex++;
        });

        // Thêm tổng của danh mục
        const categoryTotalRow = worksheet.addRow([
          ` Tổng ${categoryName}`,
          categoryData.categoryTotal.totalSold,
          categoryData.categoryTotal.totalRevenue,
        ]);
        categoryTotalRow.eachCell((cell, colNumber) => {
          Object.assign(cell, {
            ...cellStyle,
            font: { ...cellStyle.font, bold: true },
            fill: {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF0F8FF" },
            },
          });
          if (colNumber === 3) {
            // Cột doanh thu
            cell.numFmt = '#,##0"₫"';
          }
        });
        currentRowIndex++;

        // Thêm dòng trống giữa các danh mục
        worksheet.addRow([]);
        currentRowIndex++;
      });

    // Thêm tổng hợp cuối cùng
    const totalRowData = [
      " TỔNG CỘNG TẤT CẢ",
      grandTotalProducts,
      grandTotalRevenue,
    ];
    const totalRow = worksheet.addRow(totalRowData);
    totalRow.eachCell((cell, colNumber) => {
      Object.assign(cell, {
        ...cellStyle,
        font: { ...cellStyle.font, bold: true, size: 12 },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFEB9C" },
        },
      });
      if (colNumber === 3) {
        // Cột doanh thu
        cell.numFmt = '#,##0"₫"';
      }
    });

    // Điều chỉnh độ rộng cột
    worksheet.columns = [
      { header: "Danh mục / Sản phẩm", key: "category", width: 40 },
      { header: "Số lượng bán", key: "totalSold", width: 15 },
      { header: "Doanh thu (VND)", key: "totalRevenue", width: 25 },
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
    console.error("Error in revenue report:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
