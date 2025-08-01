import Image from "next/image";
import { assets } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { useState, useEffect, useRef } from "react";

const ProductCard = ({ product }) => {
  const router = useRouter();
  const { currency, formatCurrency } = useAppContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  // Hàm renderStars để hiển thị sao với hỗ trợ thập phân
  const renderStars = (ratingValue) => {
    const numericRating = parseFloat(ratingValue) || 0;
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.25 && numericRating % 1 < 0.75;
    const ratingCount = product.ratings?.length || 0;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return (
              <Image
                key={index}
                className="h-3 w-3"
                src={assets.star_icon}
                alt="star_icon"
              />
            );
          } else if (index === fullStars && hasHalfStar) {
            return (
              <Image
                key={index}
                className="h-3 w-3"
                src={assets.haf_star} // Giả sử bạn có assets.star_half_icon
                alt="star_half_icon"
              />
            );
          } else {
            return (
              <Image
                key={index}
                className="h-3 w-3"
                src={assets.star_dull_icon}
                alt="star_icon"
              />
            );
          }
        })}
        {ratingCount > 0 && (
          <span className="ml-1 text-xs text-gray-500">({ratingCount})</span>
        )}
      </div>
    );
  };

  // Xử lý khi nhấn "Mua Ngay"
  const handleBuyNow = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click trên card
    router.push(`/product/${product._id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Kiểm tra nếu product không tồn tại
  if (!product || !product._id) {
    return <div>Product data is missing</div>;
  }

  // Lấy giá từ variants nếu product không có giá
  const getProductPrice = () => {
    // Nếu product có giá trực tiếp, sử dụng giá đó
    if (product.price && product.price > 0) {
      return {
        price: product.price,
        offerPrice: product.offerPrice || product.price,
      };
    }

    // Nếu không có giá, lấy từ variant đầu tiên
    if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      return {
        price: firstVariant.price || 0,
        offerPrice: firstVariant.offerPrice || firstVariant.price || 0,
      };
    }

    // Nếu không có gì, trả về 0
    return { price: 0, offerPrice: 0 };
  };

  const { price, offerPrice } = getProductPrice();

  // Lấy danh sách ảnh, sử dụng placeholder nếu không có
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [assets.placeholder_image];
  const currentImage = images[currentImageIndex];

  // Effect để xử lý chuyển ảnh tự động khi hover
  useEffect(() => {
    if (isHovered && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 1500); // Chuyển ảnh mỗi 1.5 giây
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (!isHovered) {
        setCurrentImageIndex(0); // Quay lại ảnh đầu tiên khi không hover
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, images.length]);

  // Xử lý hover để bắt đầu/dừng chuyển ảnh
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      onClick={() => {
        router.push(`/product/${product._id}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="flex flex-col items-start gap-0.5 max-w-[280px] w-full cursor-pointer"
    >
      <div
        className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={currentImage} // Sử dụng ảnh hiện tại
          alt={product.name || "Product Image"}
          className="group-hover:scale-105 transition-all object-cover w-4/5 h-4/5 md:w-full md:h-full duration-500 ease-in-out"
          width={800}
          height={800}
        />
        <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
          <Image className="h-3 w-3" src={assets.heart_icon} alt="heart_icon" />
        </button>
      </div>

      <p className="md:text-base font-medium pt-2 w-full truncate">
        {product.name}
      </p>
      <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">
        {product.description}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-xs">
          {product.averageRating
            ? parseFloat(product.averageRating).toFixed(1)
            : "0.0"}
        </p>
        {renderStars(product.averageRating)}
      </div>

      <div className="flex flex-col w-full mt-1 gap-2">
        <div className="flex flex-col gap-1">
          {offerPrice && offerPrice !== price ? (
            <>
              <p className="text-lg font-medium text-orange-600 truncate whitespace-nowrap">
                {formatCurrency(offerPrice)}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 line-through truncate whitespace-nowrap">
                  {formatCurrency(price)}
                </p>
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                  -{Math.round(((price - offerPrice) / price) * 100)}%
                </span>
              </div>
            </>
          ) : (
            <p className="text-lg font-medium truncate whitespace-nowrap">
              {formatCurrency(price || 0)}
            </p>
          )}
        </div>
        <button
          onClick={handleBuyNow}
          className="w-full py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors duration-200"
          disabled={product.stock <= 0}
        >
          {product.stock <= 0 ? "Hết hàng" : "Mua ngay"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
