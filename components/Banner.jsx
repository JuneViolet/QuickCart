import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const Banner = ({
  title = "Nâng Cấp Trải Nghiệm Chơi Game Của Bạn",
  description = "Từ Âm Thanh Sống Động Đến Các Điều Khiển Chính Xác—Mọi Thứ Bạn Cần Để Giành Chiến Thắng",
  buttonText = "Mua Ngay",
  navigationPath = "/all-products",
  categoryFilter = "gaming console",
  leftImage = assets.jbl_soundbox_image,
  rightImageMd = assets.md_controller_image,
  rightImageSm = assets.sm_controller_image,
}) => {
  const { router } = useAppContext();

  const handleBuyNow = () => {
    if (categoryFilter) {
      // Nếu có categoryFilter, chuyển đến trang all-products với query parameter
      router.push(
        `${navigationPath}?category=${encodeURIComponent(categoryFilter)}`
      );
    } else {
      // Nếu không có categoryFilter, chuyển đến đường dẫn được chỉ định
      router.push(navigationPath);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between md:pl-20 py-14 md:py-0 bg-[#E6E9F2] my-16 rounded-xl overflow-hidden">
      <Image className="max-w-56" src={leftImage} alt="banner_left_image" />
      <div className="flex flex-col items-center justify-center text-center space-y-2 px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-semibold max-w-[290px]">
          {title}
        </h2>
        <p className="max-w-[343px] font-medium text-gray-800/60">
          {description}
        </p>
        <button
          onClick={handleBuyNow}
          className="group flex items-center justify-center gap-1 px-12 py-2.5 bg-orange-600 rounded text-white hover:bg-orange-700 transition"
        >
          {buttonText}
          <Image
            className="group-hover:translate-x-1 transition"
            src={assets.arrow_icon_white}
            alt="arrow_icon_white"
          />
        </button>
      </div>
      <Image
        className="hidden md:block max-w-80"
        src={rightImageMd}
        alt="banner_right_image_md"
      />
      <Image
        className="md:hidden"
        src={rightImageSm}
        alt="banner_right_image_sm"
      />
    </div>
  );
};

export default Banner;
