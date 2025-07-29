import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext"; // Import useAppContext

const products = [
  {
    id: 1,
    image: assets.girl_with_headphone_image,
    title: "Âm Thanh Sống Động",
    description: "Trải nghiệm âm thanh trong trẻo với tai nghe cao cấp.",
    navigationPath: "/all-products",
    categoryFilter: "tai-nghe", // Chuyển đến danh mục tai nghe
    productId: "67e02e280804d574079f0c19", // Hoặc chuyển đến sản phẩm cụ thể
  },
  {
    id: 2,
    image: assets.girl_with_earphone_image,
    title: "Kết Nối Liên Tục",
    description: "Tai nghe nhỏ gọn và phong cách cho mọi nơi.",
    navigationPath: "/all-products",
    categoryFilter: "tai-nghe", // Chuyển đến danh mục tai nghe
    productId: "67e0297cca09637ce259c58c", // Hoặc chuyển đến sản phẩm cụ thể
  },
  {
    id: 3,
    image: assets.boy_with_laptop_image,
    title: "Sức Mạnh Trong Từng Pixel",
    description:
      "Khám phá laptop mới nhất cho công việc, chơi game và nhiều hơn nữa.",
    navigationPath: "/all-products",
    categoryFilter: "laptop", // Chuyển đến danh mục laptop
    productId: "67e2b8543f5e7df5265b0469",
  },
];

const FeaturedProduct = () => {
  const { router } = useAppContext(); // Lấy router từ context

  // Cập nhật hàm handleBuyNow để hỗ trợ productId và categoryFilter giống HeaderSlider
  const handleBuyNow = async (navigationPath, categoryFilter, productId) => {
    console.log("FeaturedProduct - handleBuyNow called with:", {
      navigationPath,
      categoryFilter,
      productId,
    });

    if (productId) {
      // Kiểm tra xem productId có hợp lệ không
      try {
        console.log("Checking if product exists:", productId);
        const response = await fetch(`/api/product/${productId}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Product found:", data);
          // Nếu có productId và sản phẩm tồn tại, chuyển thẳng đến trang sản phẩm
          console.log("Navigating to product:", `/product/${productId}`);
          router.push(`/product/${productId}`);
        } else {
          console.error("Product not found, falling back to category filter");
          // Nếu sản phẩm không tồn tại, fallback về categoryFilter
          if (categoryFilter) {
            const url = `${navigationPath}?category=${encodeURIComponent(
              categoryFilter
            )}`;
            console.log("Navigating to category:", url);
            router.push(url);
          } else {
            console.log("Navigating to default path:", navigationPath);
            router.push(navigationPath);
          }
        }
      } catch (error) {
        console.error("Error checking product:", error);
        // Nếu có lỗi, fallback về categoryFilter
        if (categoryFilter) {
          const url = `${navigationPath}?category=${encodeURIComponent(
            categoryFilter
          )}`;
          console.log("Navigating to category (error fallback):", url);
          router.push(url);
        } else {
          console.log(
            "Navigating to default path (error fallback):",
            navigationPath
          );
          router.push(navigationPath);
        }
      }
    } else if (categoryFilter) {
      // Nếu có categoryFilter, chuyển đến trang all-products với query parameter
      const url = `${navigationPath}?category=${encodeURIComponent(
        categoryFilter
      )}`;
      console.log("Navigating to category:", url);
      router.push(url);
    } else {
      // Nếu không có gì, chuyển đến đường dẫn được chỉ định
      console.log("Navigating to path:", navigationPath);
      router.push(navigationPath);
    }
  };

  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Sản Phẩm Nổi Bật</p>
        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {products.map(
          ({
            id,
            image,
            title,
            description,
            navigationPath,
            categoryFilter,
            productId,
          }) => (
            <div key={id} className="relative group">
              <Image
                src={image}
                alt={title}
                className="group-hover:brightness-75 transition duration-300 w-full h-auto object-cover"
              />
              <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
                <p className="font-medium text-xl lg:text-2xl">{title}</p>
                <p className="text-sm lg:text-base leading-5 max-w-60">
                  {description}
                </p>
                <button
                  onClick={() =>
                    handleBuyNow(navigationPath, categoryFilter, productId)
                  } // Cập nhật sự kiện onClick
                  className="flex items-center gap-1.5 bg-orange-600 px-4 py-2 rounded"
                >
                  Mua Ngay{" "}
                  <Image
                    className="h-3 w-3"
                    src={assets.redirect_icon}
                    alt="Redirect Icon"
                  />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default FeaturedProduct;
