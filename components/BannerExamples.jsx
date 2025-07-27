import React from "react";
import Banner from "./Banner";
import { assets } from "@/assets/assets";

// Component ví dụ để demo cách sử dụng Banner với các tùy chọn khác nhau
const BannerExamples = () => {
  return (
    <div className="space-y-8">
      {/* Banner mặc định - chuyển đến trang all-products */}
      <Banner />

      {/* Banner cho tai nghe - lọc theo category tai-nghe */}
      <Banner
        title="Trải Nghiệm Âm Thanh Hoàn Hảo"
        description="Khám phá bộ sưu tập tai nghe chất lượng cao với âm thanh sống động"
        buttonText="Xem Tai Nghe"
        navigationPath="/all-products"
        categoryFilter="tai-nghe"
        leftImage={assets.apple_earphone_image}
        rightImageMd={assets.bose_headphone_image}
        rightImageSm={assets.bose_headphone_image}
      />

      {/* Banner cho laptop - lọc theo category laptop */}
      <Banner
        title="Laptop Gaming Mạnh Mẽ"
        description="Sức mạnh tối đa cho công việc và giải trí với các dòng laptop cao cấp"
        buttonText="Xem Laptop"
        navigationPath="/all-products"
        categoryFilter="laptop"
        leftImage={assets.asus_laptop_image}
        rightImageMd={assets.boy_with_laptop_image}
        rightImageSm={assets.boy_with_laptop_image}
      />

      {/* Banner chuyển đến trang cụ thể khác */}
      <Banner
        title="Về Chúng Tôi"
        description="Tìm hiểu thêm về câu chuyện và sứ mệnh của QuickCart"
        buttonText="Tìm Hiểu Thêm"
        navigationPath="/about-us"
        categoryFilter={null}
        leftImage={assets.aboutus}
        rightImageMd={assets.entity}
        rightImageSm={assets.entity}
      />

      {/* Banner cho camera - lọc theo category camera */}
      <Banner
        title="Ghi Lại Những Khoảnh Khắc Đẹp"
        description="Máy ảnh chuyên nghiệp để bạn lưu giữ những kỷ niệm quý giá"
        buttonText="Xem Camera"
        navigationPath="/all-products"
        categoryFilter="camera"
        leftImage={assets.cannon_camera_image}
        rightImageMd={assets.cannon_camera_image}
        rightImageSm={assets.cannon_camera_image}
      />
    </div>
  );
};

export default BannerExamples;
