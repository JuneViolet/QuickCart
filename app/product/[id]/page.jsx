// "use client";
// import { useEffect, useState } from "react";
// import { assets } from "@/assets/assets";
// import ProductCard from "@/components/ProductCard";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import Image from "next/image";
// import { useParams } from "next/navigation";
// import Loading from "@/components/Loading";
// import { useAppContext } from "@/context/AppContext";

// const Product = () => {
//   const { id } = useParams();
//   const { router, addToCart, formatCurrency } = useAppContext();
//   const [mainImage, setMainImage] = useState(null);
//   const [productData, setProductData] = useState(null);
//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchProductData = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/product/${id}`);
//       if (!response.ok) throw new Error("Failed to fetch product");
//       const data = await response.json();
//       if (data.success) {
//         setProductData(data.product);
//       } else {
//         setError(data.message);
//       }
//     } catch (error) {
//       console.error("Fetch Product Error:", error.message);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (id) fetchProductData();
//   }, [id]);

//   const handleSubmitReview = async (e) => {
//     e.preventDefault();
//     if (rating < 1 || rating > 5) {
//       alert("Please select a rating between 1 and 5 stars.");
//       return;
//     }
//     const res = await fetch("/api/product/review", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ productId: id, rating, comment }),
//     });
//     if (res.ok) {
//       await fetchProductData();
//       setRating(0);
//       setComment("");
//     } else {
//       alert("Failed to submit review");
//     }
//   };

//   const handleAddToCart = () => {
//     if (productData.stock <= 0) {
//       alert("Product is out of stock!");
//       return;
//     }
//     addToCart(productData._id);
//   };

//   const handleBuyNow = () => {
//     if (productData.stock <= 0) {
//       alert("Product is out of stock!");
//       return;
//     }
//     addToCart(productData._id);
//     router.push("/cart");
//   };

//   const averageRating =
//     productData?.reviews?.length > 0
//       ? (
//           productData.reviews.reduce((sum, review) => sum + review.rating, 0) /
//           productData.reviews.length
//         ).toFixed(1)
//       : 0;

//   const renderStars = (ratingValue, onClick = null) => {
//     return (
//       <div className="flex items-center gap-0.5">
//         {[...Array(5)].map((_, index) => (
//           <Image
//             key={index}
//             className="h-4 w-4 cursor-pointer"
//             src={
//               index < Math.floor(ratingValue)
//                 ? assets.star_icon
//                 : assets.star_dull_icon
//             }
//             alt="star_icon"
//             onClick={onClick ? () => onClick(index + 1) : null}
//           />
//         ))}
//       </div>
//     );
//   };

//   return loading ? (
//     <Loading />
//   ) : error ? (
//     <div className="text-center py-10">Error: {error}</div>
//   ) : !productData ? (
//     <div className="text-center py-10">No product data</div>
//   ) : (
//     <>
//       <Navbar />
//       <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
//           <div className="px-5 lg:px-16 xl:px-20">
//             <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4 aspect-[4/4]">
//               <Image
//                 src={mainImage || productData.image[0]}
//                 alt={productData.name}
//                 className="w-full h-full object-cover mix-blend-multiply"
//                 width={1280}
//                 height={720}
//               />
//             </div>
//             <div className="grid grid-cols-4 gap-4">
//               {productData.image.map((image, index) => (
//                 <div
//                   key={index}
//                   onClick={() => setMainImage(image)}
//                   className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 aspect-[4/4]"
//                 >
//                   <Image
//                     src={image}
//                     alt={productData.name}
//                     className="w-full h-full object-cover mix-blend-multiply"
//                     width={1280}
//                     height={720}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="flex flex-col">
//             <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
//               {productData.name}
//             </h1>
//             <div className="flex items-center gap-2">
//               {renderStars(averageRating)}
//               <p>({averageRating})</p>
//             </div>
//             <p className="text-gray-600 mt-3">{productData.description}</p>
//             <p className="text-3xl font-medium mt-6">
//               {formatCurrency(productData.offerPrice)}{" "}
//               <span className="text-base font-normal text-gray-800/60 line-through ml-2">
//                 {formatCurrency(productData.price)}{" "}
//               </span>
//             </p>
//             <hr className="bg-gray-600 my-6" />
//             <div className="overflow-x-auto">
//               <table className="table-auto border-collapse w-full max-w-72">
//                 <tbody>
//                   <tr>
//                     <td className="text-gray-600 font-medium">Loại</td>
//                     <td className="text-gray-800/50">
//                       {productData.category}
//                       {/* ?.name || "N/A" */}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td className="text-gray-600 font-medium">Hãng</td>
//                     <td className="text-gray-800/50">{productData.brand}</td>
//                   </tr>
//                   <tr>
//                     <td className="text-gray-600 font-medium">Số lượng</td>
//                     <td className="text-gray-800/50">
//                       {productData.stock > 0 ? productData.stock : "Hết hàng"}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//             <div className="flex items-center mt-10 gap-4">
//               <button
//                 onClick={handleAddToCart}
//                 className={`w-full py-3.5 text-gray-800/80 transition ${
//                   productData.stock > 0
//                     ? "bg-gray-100 hover:bg-gray-200"
//                     : "bg-gray-300 cursor-not-allowed"
//                 }`}
//                 disabled={productData.stock <= 0}
//               >
//                 Thêm Vào Giỏ Hàng
//               </button>
//               <button
//                 onClick={handleBuyNow}
//                 className={`w-full py-3.5 text-white transition ${
//                   productData.stock > 0
//                     ? "bg-orange-500 hover:bg-orange-600"
//                     : "bg-orange-300 cursor-not-allowed"
//                 }`}
//                 disabled={productData.stock <= 0}
//               >
//                 Mua Ngay
//               </button>
//             </div>
//           </div>
//         </div>
//         <div className="mt-6">
//           <h2 className="text-xl font-semibold">Add a Review</h2>
//           <form onSubmit={handleSubmitReview} className="mt-4">
//             <div>
//               <label>Rating:</label>
//               <div className="inline-block ml-2">
//                 {renderStars(rating, setRating)}
//               </div>
//             </div>
//             <div className="mt-2">
//               <label>Comment:</label>
//               <textarea
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 className="border p-2 w-full mt-2"
//                 required
//               />
//             </div>
//             <button type="submit" className="bg-blue-500 text-white p-2 mt-2">
//               Submit Review
//             </button>
//           </form>
//         </div>
//         <div className="mt-6">
//           <h2 className="text-xl font-semibold">Reviews</h2>
//           {productData.reviews?.length > 0 ? (
//             productData.reviews.map((review, index) => (
//               <div key={index} className="border p-4 mt-2">
//                 <p className="font-medium">
//                   {review.username || "Anonymous"} đã bình luận
//                 </p>
//                 <div className="flex items-center gap-2">
//                   {renderStars(review.rating)}
//                   <p>({review.rating}/5)</p>
//                 </div>
//                 <p>{review.comment}</p>
//                 <p>
//                   Posted on: {new Date(review.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//             ))
//           ) : (
//             <p>No reviews yet.</p>
//           )}
//         </div>
//         <div className="flex flex-col items-center">
//           <div className="flex flex-col items-center mb-4 mt-16">
//             <p className="text-3xl font-medium">
//               Featured{" "}
//               <span className="font-medium text-orange-600">Products</span>
//             </p>
//             <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
//             {productData.relatedProducts?.length > 0 ? (
//               productData.relatedProducts
//                 .slice(0, 10)
//                 .map((product, index) => (
//                   <ProductCard key={index} product={product} />
//                 ))
//             ) : (
//               <p>No related products</p>
//             )}
//           </div>
//           <button
//             onClick={() => router.push("/all-products")}
//             className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
//           >
//             See more
//           </button>
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default Product;
"use client";
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";

const Product = () => {
  const { id } = useParams();
  const { router, addToCart, formatCurrency } = useAppContext();
  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State cho modal

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/product/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      const data = await response.json();
      if (data.success) {
        setProductData(data.product);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Fetch Product Error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProductData();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5 stars.");
      return;
    }
    const res = await fetch("/api/product/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, rating, comment }),
    });
    if (res.ok) {
      await fetchProductData();
      setRating(0);
      setComment("");
    } else {
      alert("Failed to submit review");
    }
  };

  const handleAddToCart = () => {
    if (productData.stock <= 0) {
      alert("Product is out of stock!");
      return;
    }
    addToCart(productData._id);
  };

  const handleBuyNow = () => {
    if (productData.stock <= 0) {
      alert("Product is out of stock!");
      return;
    }
    addToCart(productData._id);
    router.push("/cart");
  };

  const averageRating =
    productData?.averageRating !== undefined
      ? productData.averageRating
      : productData?.reviews?.length > 0
      ? (
          productData.reviews.reduce((sum, review) => sum + review.rating, 0) /
          productData.reviews.length
        ).toFixed(1)
      : 0;

  const renderStars = (ratingValue, onClick = null) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Image
            key={index}
            className="h-4 w-4 cursor-pointer"
            src={
              index < Math.floor(ratingValue)
                ? assets.star_icon
                : assets.star_dull_icon
            }
            alt="star_icon"
            onClick={onClick ? () => onClick(index + 1) : null}
          />
        ))}
      </div>
    );
  };

  return loading ? (
    <Loading />
  ) : error ? (
    <div className="text-center py-10">Error: {error}</div>
  ) : !productData ? (
    <div className="text-center py-10">No product data</div>
  ) : (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4 aspect-[4/4]">
              <Image
                src={
                  mainImage ||
                  productData.images?.[0] ||
                  assets.placeholder_image
                }
                alt={productData.name}
                className="w-full h-full object-cover mix-blend-multiply"
                width={1280}
                height={720}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productData.images?.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(image)}
                  className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 aspect-[4/4]"
                >
                  <Image
                    src={image}
                    alt={productData.name}
                    className="w-full h-full object-cover mix-blend-multiply"
                    width={1280}
                    height={720}
                  />
                </div>
              ))}
            </div>
            {/* Hiển thị một phần thông số kỹ thuật */}
            {productData.specifications?.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold flex justify-center">
                  Thông Số Kỹ Thuật
                </h2>
                <table className="table-auto border-collapse w-full mt-2">
                  <tbody>
                    {productData.specifications
                      .slice(
                        0,
                        Math.ceil(productData.specifications.length / 2)
                      )
                      .map((spec, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2 text-gray-600 font-medium">
                            {spec.key}
                          </td>
                          <td className="p-2 text-gray-800/50">
                            {Array.isArray(spec.value) ? (
                              <ul className="list-disc list-inside">
                                {spec.value.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            ) : (
                              spec.value
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {productData.specifications.length > 2 && (
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      Xem đầy đủ thông số kỹ thuật
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
              {productData.name}
            </h1>
            <div className="flex items-center gap-2">
              {renderStars(averageRating)}
              <p>({averageRating})</p>
            </div>
            <p className="text-gray-600 mt-3">{productData.description}</p>
            <p className="text-3xl font-medium mt-6">
              {formatCurrency(productData.offerPrice)}{" "}
              <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                {formatCurrency(productData.price)}{" "}
              </span>
            </p>
            <hr className="bg-gray-600 my-6" />
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>
                  <tr>
                    <td className="text-gray-600 font-medium">Loại</td>
                    <td className="text-gray-800/50">
                      {productData.category?.name || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Hãng</td>
                    <td className="text-gray-800/50">
                      {productData.brand?.name || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Số lượng</td>
                    <td className="text-gray-800/50">
                      {productData.stock > 0 ? productData.stock : "Hết hàng"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-center mt-10 gap-4">
              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 text-gray-800/80 transition ${
                  productData.stock > 0
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                disabled={productData.stock <= 0}
              >
                Thêm Vào Giỏ Hàng
              </button>
              <button
                onClick={handleBuyNow}
                className={`w-full py-3.5 text-white transition ${
                  productData.stock > 0
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-orange-300 cursor-not-allowed"
                }`}
                disabled={productData.stock <= 0}
              >
                Mua Ngay
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Add a Review</h2>
          <form onSubmit={handleSubmitReview} className="mt-4">
            <div>
              <label>Rating:</label>
              <div className="inline-block ml-2">
                {renderStars(rating, setRating)}
              </div>
            </div>
            <div className="mt-2">
              <label>Comment:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border p-2 w-full mt-2"
                required
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 mt-2">
              Submit Review
            </button>
          </form>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Reviews</h2>
          {productData.reviews?.length > 0 ? (
            productData.reviews.map((review, index) => (
              <div key={index} className="border p-4 mt-2">
                <p className="font-medium">
                  {review.username || "Anonymous"} đã bình luận
                </p>
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <p>({review.rating}/5)</p>
                </div>
                <p>{review.comment}</p>
                <p>
                  Posted on: {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-4 mt-16">
            <p className="text-3xl font-medium">
              Featured{" "}
              <span className="font-medium text-orange-600">Products</span>
            </p>
            <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
            {productData.relatedProducts?.length > 0 ? (
              productData.relatedProducts
                .slice(0, 10)
                .map((product, index) => (
                  <ProductCard key={index} product={product} />
                ))
            ) : (
              <p>No related products</p>
            )}
          </div>
          <button
            onClick={() => router.push("/all-products")}
            className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
          >
            See more
          </button>
        </div>
      </div>
      <Footer />
      {/* Modal cho thông số kỹ thuật */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Thông Số Kỹ Thuật</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Image src={assets.x_icon} alt="close" className="w-6 h-6" />
              </button>
            </div>
            <table className="table-auto border-collapse w-full">
              <tbody>
                {productData.specifications.map((spec, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2 text-gray-600 font-medium">
                      {spec.key}
                    </td>
                    <td className="p-2 text-gray-800/50">
                      {Array.isArray(spec.value) ? (
                        <ul className="list-disc list-inside">
                          {spec.value.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        spec.value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default Product;
