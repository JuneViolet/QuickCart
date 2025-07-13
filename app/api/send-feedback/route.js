import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email, subject, message } = await request.json();

    // Cấu hình transporter (sử dụng Gmail làm ví dụ)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Thêm vào .env: EMAIL_USER=your-email@gmail.com
        pass: process.env.EMAIL_PASS, // Thêm vào .env: EMAIL_PASS=your-app-password
      },
    });

    // Thông tin email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || "admin@yourdomain.com", // Thêm vào .env: ADMIN_EMAIL=admin-email
      replyTo: email || process.env.EMAIL_USER,
      subject: subject || "Phản hồi từ khách hàng",
      text: message || "Không có nội dung",
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Phản hồi đã được gửi!",
    });
  } catch (error) {
    console.error("Send Feedback Error:", error);
    return NextResponse.json(
      { success: false, message: "Gửi phản hồi thất bại: " + error.message },
      { status: 500 }
    );
  }
}
