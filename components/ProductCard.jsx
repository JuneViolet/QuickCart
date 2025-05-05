// import React from "react";
// import { assets } from "@/assets/assets";
// import Image from "next/image";
// import { useAppContext } from "@/context/AppContext";

// const ProductCard = ({ product }) => {
//   const { currency, router } = useAppContext();

//   return (
//     <div
//       onClick={() => {
//         router.push("/product/" + product._id);
//         scrollTo(0, 0);
//       }}
//       className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
//     >
//       <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
//         <Image
//           src={product.image[0]}
//           alt={product.name}
//           className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
//           width={800}
//           height={800}
//         />
//         <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
//           <Image className="h-3 w-3" src={assets.heart_icon} alt="heart_icon" />
//         </button>
//       </div>

//       <p className="md:text-base font-medium pt-2 w-full truncate">
//         {product.name}
//       </p>
//       <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">
//         {product.description}
//       </p>
//       <div className="flex items-center gap-2">
//         <p className="text-xs">{4.5}</p>
//         <div className="flex items-center gap-0.5">
//           {Array.from({ length: 5 }).map((_, index) => (
//             <Image
//               key={index}
//               className="h-3 w-3"
//               src={
//                 index < Math.floor(4) ? assets.star_icon : assets.star_dull_icon
//               }
//               alt="star_icon"
//             />
//           ))}
//         </div>
//       </div>

//       <div className="flex items-end justify-between w-full mt-1">
//         <p className="text-base font-medium">
//           {currency}
//           {product.offerPrice}
//         </p>
//         <button className=" max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition">
//           Mua Ngay
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

const ProductCard = ({ product }) => {
  const router = useRouter();
  const { currency, formatCurrency } = useAppContext();

  // Hàm renderStars để hiển thị sao
  const renderStars = (ratingValue) => {
    const numericRating = parseFloat(ratingValue) || 0;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Image
            key={index}
            className="h-3 w-3"
            src={
              index < Math.floor(numericRating)
                ? assets.star_icon
                : assets.star_dull_icon
            }
            alt="star_icon"
          />
        ))}
      </div>
    );
  };

  // Xử lý khi nhấn "Mua Ngay"
  const handleBuyNow = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click trên card
    router.push("/product/" + product._id); // Chuyển hướng đến trang chi tiết
    window.scrollTo(0, 0); // Sửa scrollTo thành window.scrollTo để đảm bảo hoạt động
  };

  return (
    <div
      onClick={() => {
        router.push("/product/" + product._id);
        window.scrollTo(0, 0);
      }}
      className="flex flex-col items-start gap-0.5 max-w-[280px] w-full cursor-pointer" // Tăng max-w từ 250px lên 280px
    >
      <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
        <Image
          src={product.image[0]}
          alt={product.name}
          className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
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
        <p className="text-xs">{product.averageRating}</p>
        <div className="flex items-center gap-0.5">
          {renderStars(product.averageRating)}
        </div>
      </div>

      <div className="flex items-end justify-between w-full mt-1">
        <p className="text-lg font-medium truncate max-w-[60%]">
          {" "}
          {/* Thêm truncate và giới hạn chiều rộng */}
          {formatCurrency(product.offerPrice)}
        </p>
        <button
          onClick={handleBuyNow}
          className="max-sm:hidden px-3 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-sm hover:bg-slate-50 transition" // Giảm px-4 xuống px-3
          disabled={product.stock <= 0}
        >
          Mua Ngay
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
