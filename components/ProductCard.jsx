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
// import Image from "next/image";
// import { assets } from "@/assets/assets";
// import { useRouter } from "next/navigation";
// import { useAppContext } from "@/context/AppContext";

// const ProductCard = ({ product }) => {
//   const router = useRouter();
//   const { currency, formatCurrency } = useAppContext();

//   // Hàm renderStars để hiển thị sao
//   const renderStars = (ratingValue) => {
//     const numericRating = parseFloat(ratingValue) || 0;
//     return (
//       <div className="flex items-center gap-0.5">
//         {[...Array(5)].map((_, index) => (
//           <Image
//             key={index}
//             className="h-3 w-3"
//             src={
//               index < Math.floor(numericRating)
//                 ? assets.star_icon
//                 : assets.star_dull_icon
//             }
//             alt="star_icon"
//           />
//         ))}
//       </div>
//     );
//   };

//   // Xử lý khi nhấn "Mua Ngay"
//   const handleBuyNow = (e) => {
//     e.stopPropagation(); // Ngăn sự kiện click trên card
//     router.push("/product/" + product._id); // Chuyển hướng đến trang chi tiết
//     window.scrollTo(0, 0); // Sửa scrollTo thành window.scrollTo để đảm bảo hoạt động
//   };

//   // Kiểm tra nếu product không tồn tại
//   if (!product || !product._id) {
//     return <div>Product data is missing</div>; // Fallback nếu dữ liệu không hợp lệ
//   }

//   return (
//     <div
//       onClick={() => {
//         router.push("/product/" + product._id);
//         window.scrollTo(0, 0);
//       }}
//       className="flex flex-col items-start gap-0.5 max-w-[280px] w-full cursor-pointer"
//     >
//       <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
//         <Image
//           src={product.images?.[0] || assets.placeholder_image} // Sửa từ product.image[0] sang product.images?.[0]
//           alt={product.name || "Product Image"}
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
//         <p className="text-xs">{product.averageRating}</p>
//         <div className="flex items-center gap-0.5">
//           {renderStars(product.averageRating)}
//         </div>
//       </div>

//       <div className="flex items-end justify-between w-full mt-1">
//         <p className="text-lg font-medium truncate max-w-[60%]">
//           {formatCurrency(product.offerPrice)}
//         </p>
//         <button
//           onClick={handleBuyNow}
//           className="max-sm:hidden px-3 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-sm hover:bg-slate-50 transition"
//           disabled={product.stock <= 0}
//         >
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

  // Xử lý src an toàn
  const imageSrc = product.images?.[0] || assets.placeholder_image;

  return (
    <div
      onClick={() => {
        router.push(`/product/${product._id}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="flex flex-col items-start gap-0.5 max-w-[280px] w-full cursor-pointer"
    >
      <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
        <Image
          src={imageSrc} // Sử dụng biến imageSrc đã xử lý
          alt={product.name || "Product Image"}
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
        <p className="text-xs">
          {product.averageRating
            ? parseFloat(product.averageRating).toFixed(1)
            : "0.0"}
        </p>
        {renderStars(product.averageRating)}
      </div>

      <div className="flex items-end justify-between w-full mt-1">
        <p className="text-lg font-medium truncate max-w-[60%]">
          {formatCurrency(product.offerPrice || product.price)}
        </p>
        <button
          onClick={handleBuyNow}
          className="max-sm:hidden px-3 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-sm hover:bg-slate-50 transition"
          disabled={product.stock <= 0}
        >
          Mua Ngay
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
