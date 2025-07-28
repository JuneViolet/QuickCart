import React, { useState, useEffect, useRef } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAppContext } from "@/context/AppContext";

const HeaderSlider = () => {
  const { router } = useAppContext();

  const sliderData = [
    {
      id: 1,
      title:
        "Trải Nghiệm Âm Thanh Thuần Khiết - Tai Nghe Hoàn Hảo Đang Chờ Bạn!",
      offer: "Khuyến Mãi Thời Gian Có Hạn Giảm Giá 30%",
      buttonText1: "Mua Ngay",
      buttonText2: "Tìm Hiểu Thêm",
      imgSrc: assets.header_headphone_image,
      navigationPath1: "/all-products",
      categoryFilter1: "tai-nghe",
      navigationPath2: "/all-products",
      categoryFilter2: "tai-nghe",
    },
    {
      id: 2,
      title:
        "Trải Nghiệm Chơi Game Đẳng Cấp Mới Bắt Đầu Tại Đây - Khám Phá PlayStation 5 Ngay Hôm Nay!",
      offer: "Nhanh Tay Lên, Chỉ Còn Vài Cái Nữa Thôi!",
      buttonText1: "Mua Ngay PS5",
      buttonText2: "Khám phá các console khác",
      imgSrc: assets.header_playstation_image,
      // Chuyển thẳng đến sản phẩm PlayStation 5
      navigationPath1: "/product/67e02c4fca09637ce259c590", // Sử dụng ID MongoDB
      productId1: "67e02c4fca09637ce259c590",
      // Nút thứ 2 vẫn chuyển đến danh mục gaming console
      navigationPath2: "/all-products",
      categoryFilter2: "gaming console",
    },
    {
      id: 3,
      title:
        "Sức Mạnh Kết Hợp Với Sự Thanh Lịch - Apple MacBook Pro Dành Cho Bạn!",
      offer: "Ưu Đãi Độc Quyền Giảm Giá 40%",
      buttonText1: "Đặt Hàng Ngay",
      buttonText2: "Tìm Hiểu Thêm",
      imgSrc: assets.header_macbook_image,
      navigationPath1: "/all-products",
      categoryFilter1: "laptop",
      navigationPath2: "/all-products",
      categoryFilter2: "laptop",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const autoSlideRef = useRef(null);

  // Hàm set slide auto chạy
  const startAutoSlide = () => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 3000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, []);

  const handleManualSlide = (direction) => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);

    setCurrentSlide((prev) => {
      if (direction === "prev")
        return prev === 0 ? sliderData.length - 1 : prev - 1;
      else return (prev + 1) % sliderData.length;
    });

    setTimeout(() => {
      startAutoSlide();
    }, 5000);
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    setTimeout(() => {
      startAutoSlide();
    }, 5000);
  };

  // Cập nhật hàm handleButtonClick để hỗ trợ productId
  const handleButtonClick = (navigationPath, categoryFilter, productId) => {
    if (productId) {
      // Nếu có productId, chuyển thẳng đến trang sản phẩm
      router.push(`/product/${productId}`);
    } else if (categoryFilter) {
      // Nếu có categoryFilter, chuyển đến trang all-products với query parameter
      router.push(
        `${navigationPath}?category=${encodeURIComponent(categoryFilter)}`
      );
    } else {
      // Nếu không có gì, chuyển đến đường dẫn được chỉ định
      router.push(navigationPath);
    }
  };

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full shadow-md"
          >
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-orange-600 pb-1">{slide.offer}</p>
              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold">
                {slide.title}
              </h1>
              <div className="flex items-center mt-4 md:mt-6 gap-3">
                <button
                  onClick={() =>
                    handleButtonClick(
                      slide.navigationPath1,
                      slide.categoryFilter1,
                      slide.productId1 // Thay đổi từ productSlug1 thành productId1
                    )
                  }
                  className="md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium hover:bg-orange-700 transition hover:scale-105"
                >
                  {slide.buttonText1}
                </button>
                <button
                  onClick={() =>
                    handleButtonClick(
                      slide.navigationPath2,
                      slide.categoryFilter2,
                      slide.productId2 // Thay đổi từ productSlug2 thành productId2
                    )
                  }
                  className="group flex items-center gap-2 px-6 py-2.5 font-medium text-orange-600 hover:text-orange-700 transition"
                >
                  {slide.buttonText2}
                  <Image
                    className="group-hover:translate-x-1 transition"
                    src={assets.arrow_icon}
                    alt="arrow_icon"
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center flex-1 justify-center">
              <Image
                className="md:w-72 w-48 rounded-lg"
                src={slide.imgSrc}
                alt={`Slide ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Nút điều hướng trái */}
      <button
        onClick={() => handleManualSlide("prev")}
        className="absolute top-1/2 left-2 md:left-4 -translate-y-1/2 bg-white border border-gray-300 shadow-md p-2 md:p-3 rounded-full hover:bg-orange-100 transition"
      >
        <FaChevronLeft className="text-orange-600 text-sm md:text-base" />
      </button>

      {/* Nút điều hướng phải */}
      <button
        onClick={() => handleManualSlide("next")}
        className="absolute top-1/2 right-2 md:right-4 -translate-y-1/2 bg-white border border-gray-300 shadow-md p-2 md:p-3 rounded-full hover:bg-orange-100 transition"
      >
        <FaChevronRight className="text-orange-600 text-sm md:text-base" />
      </button>

      {/* Chấm tròn điều hướng dưới slider */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2.5 w-2.5 rounded-full cursor-pointer transition ${
              currentSlide === index
                ? "bg-orange-600 scale-110"
                : "bg-gray-400/30"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
