"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";

const Product = () => {
  const { id } = useParams();
  const { router, addToCart, formatCurrency } = useAppContext();
  const { getToken, userId } = useAuth();
  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const imageContainerRef = useRef(null);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`/api/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.data.success)
        throw new Error(response.data.message || "Failed to fetch product");
      const data = response.data.product;
      console.log("Product Data:", data);

      const userRating = data.ratings.find((r) => r.userId === userId);
      setExistingRating(userRating ? userRating.rating : null);

      const userComments = data.comments.filter((c) => c.userId === userId);
      setComment(
        userComments.length > 0
          ? userComments[userComments.length - 1]?.comment || ""
          : ""
      );

      setHasPurchased(data.hasPurchased || false);
      setProductData(data);
      if (data.variants?.length > 0) {
        const firstVariant = data.variants[0];
        const colorAttr = firstVariant.attributeRefs?.find(
          (ref) => ref.attributeId.name === "Màu sắc"
        )?.value;
        const storageAttr = firstVariant.attributeRefs?.find(
          (ref) => ref.attributeId.name === "Dung lượng"
        )?.value;
        setSelectedColor(colorAttr || "");
        setSelectedStorage(storageAttr || "");
      }

      // Fetch related products after getting product data
      await fetchRelatedProducts(data.category?.name, data.brand?.name);
    } catch (error) {
      console.error("Fetch Product Error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryName, brandName) => {
    try {
      const token = await getToken();
      console.log("Fetching related products for:", {
        categoryName,
        brandName,
        currentProductId: id,
      });

      let relatedProducts = [];

      // Bước 1: Lấy sản phẩm cùng category và brand (ưu tiên cao nhất)
      if (categoryName && brandName) {
        const sameCategoryBrandResponse = await axios.get(`/api/product/list`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            category: categoryName,
            brand: brandName,
            limit: 10,
          },
        });

        const sameCategoryBrandProducts =
          sameCategoryBrandResponse.data.products?.filter(
            (product) => product._id !== id
          ) || [];

        relatedProducts = [...sameCategoryBrandProducts];
        console.log(
          `Found ${sameCategoryBrandProducts.length} products with same category + brand`
        );
      }

      // Bước 2: Nếu chưa có sản phẩm nào, lấy sản phẩm cùng category (khác brand)
      if (relatedProducts.length === 0 && categoryName) {
        const sameCategoryResponse = await axios.get(`/api/product/list`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            category: categoryName,
            limit: 10,
          },
        });

        const sameCategoryProducts =
          sameCategoryResponse.data.products?.filter(
            (product) => product._id !== id
          ) || [];

        relatedProducts = [...sameCategoryProducts];
        console.log(
          `Found ${sameCategoryProducts.length} products with same category`
        );
      }

      // KHÔNG lấy random products nữa - chỉ hiển thị sản phẩm thực sự liên quan
      // Nếu không có sản phẩm liên quan thì để trống

      console.log(
        "Final related products:",
        relatedProducts.map((p) => ({
          id: p._id,
          name: p.name,
          category: p.category?.name,
          brand: p.brand?.name,
        }))
      );

      // Update productData with related products
      setProductData((prev) => ({
        ...prev,
        relatedProducts: relatedProducts,
      }));
    } catch (error) {
      console.error("Fetch Related Products Error:", error.message);
      // If error, set empty array to prevent crash
      setProductData((prev) => ({
        ...prev,
        relatedProducts: [],
      }));
    }
  };

  const fetchAttributes = async () => {
    try {
      const token = await getToken();
      const response = await axios.get("/api/attributes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const attrs = response.data.attributes || [];
        console.log("Fetched Attributes:", attrs);
        setAttributes(attrs);
      }
    } catch (error) {
      console.error("Fetch Attributes Error:", error.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAttributes().then(() => {
        fetchProductData();
      });
    }
  }, [id]);

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!hasPurchased) {
      toast.error("Bạn chỉ có thể đánh giá sau khi mua sản phẩm!");
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars.");
      return;
    }
    try {
      const token = await getToken();
      const reviewData = { productId: id, rating };
      const res = await axios.put(`/api/product/review/${id}`, reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        await fetchProductData();
        setRating(0);
        toast.success("Rating updated successfully!");
      } else {
        toast.error("Failed to update rating");
      }
    } catch (error) {
      toast.error("Error updating rating: " + error.message);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!hasPurchased) {
      toast.error("Bạn chỉ có thể bình luận sau khi mua sản phẩm!");
      return;
    }
    if (!comment.trim()) {
      toast.error("Vui lòng nhập bình luận!");
      return;
    }
    try {
      const token = await getToken();
      const commentData = { productId: id, comment };
      const res = await axios.post(`/api/product/comment`, commentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        await fetchProductData();
        setComment("");
        toast.success("Comment added successfully!");
      } else {
        toast.error("Failed to submit comment");
      }
    } catch (error) {
      toast.error("Error submitting comment: " + error.message);
    }
  };

  const handleSubmitReply = async (commentId) => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập phản hồi!");
      return;
    }
    try {
      const token = await getToken();
      const replyData = {
        productId: id,
        commentId,
        reply: replyText,
      };
      const res = await axios.post(`/api/product/reply`, replyData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        await fetchProductData();
        setReplyText("");
        setReplyingTo(null);
        toast.success("Phản hồi đã được gửi!");
      } else {
        toast.error("Gửi phản hồi thất bại: " + res.data.message);
      }
    } catch (error) {
      console.error("Reply error:", error);
      toast.error(
        "Lỗi gửi phản hồi: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) {
      toast.error("Please select a variant or product is out of stock!");
      return;
    }
    addToCart(id, 1, selectedVariant._id);
  };

  const handleBuyNow = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) {
      toast.error("Please select a variant or product is out of stock!");
      return;
    }
    addToCart(id, 1, selectedVariant._id);
    router.push("/cart");
  };

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating);
    }
  }, [existingRating]);

  useEffect(() => {
    if (productData?.variants) {
      const matchedVariant = productData.variants.find((v) => {
        const colorMatch = v.attributeRefs.find(
          (ref) =>
            ref.value === selectedColor && ref.attributeId.name === "Màu sắc"
        );
        const storageMatch = selectedStorage
          ? v.attributeRefs.find(
              (ref) =>
                ref.value === selectedStorage &&
                ref.attributeId.name === "Dung lượng"
            )
          : true;
        return colorMatch && storageMatch;
      });
      setSelectedVariant(matchedVariant || null);
      if (matchedVariant?.images && matchedVariant.images.length > 0) {
        setMainImage(matchedVariant.images[0]);
      } else if (productData.images?.[0]) {
        setMainImage(productData.images[0]);
      }
      console.log("Selected Variant:", matchedVariant);
    }
  }, [selectedColor, selectedStorage, productData]);

  const getUniqueColors = () => {
    const colors = new Set();
    productData?.variants?.forEach((v) => {
      const colorAttr = v.attributeRefs.find(
        (ref) => ref.attributeId.name === "Màu sắc"
      );
      if (colorAttr?.value) colors.add(colorAttr.value);
    });
    return Array.from(colors);
  };

  const getUniqueStorages = () => {
    const storages = new Set();
    productData?.variants?.forEach((v) => {
      const storageAttr = v.attributeRefs.find(
        (ref) => ref.attributeId.name === "Dung lượng"
      );
      if (storageAttr?.value) storages.add(storageAttr.value);
    });
    return Array.from(storages);
  };

  const getColorCode = (colorValue) => {
    const colorAttr = attributes.find((attr) => attr.name === "Màu sắc");
    if (colorAttr) {
      const valueObj = colorAttr.values.find(
        (v) => (typeof v === "object" ? v.text : v) === colorValue
      );
      if (valueObj && typeof valueObj === "object" && valueObj.color) {
        return valueObj.color;
      }
    }
    const defaultColors = {
      Đỏ: "#FF0000",
      Xám: "#D3D3D3",
      Đen: "#000000",
      Vàng: "#FFD700",
    };
    return defaultColors[colorValue] || "#000000";
  };

  const scrollLeft = () => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollBy({ left: -100, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollBy({ left: 100, behavior: "smooth" });
    }
  };

  const averageRating = productData?.averageRating || 0;

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
                  selectedVariant?.images?.[0] ||
                  productData.images?.[0] ||
                  assets.placeholder_image
                }
                alt={productData.name}
                className="w-full h-full object-cover mix-blend-multiply"
                width={1280}
                height={720}
              />
            </div>
            <div className="relative">
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 opacity-50 text-white p-1.5 rounded-full z-10 text-sm hover:opacity-75"
              >
                ←
              </button>
              <div
                ref={imageContainerRef}
                className="grid grid-cols-4 gap-2 pb-4"
                style={{ scrollBehavior: "smooth" }}
              >
                {(selectedVariant?.images || productData.images || [])
                  .reduce((unique, image) => {
                    return unique.includes(image) ? unique : [...unique, image];
                  }, [])
                  .slice(0, 4)
                  .map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setMainImage(image)}
                      className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 aspect-[4/4] min-w-[70px]"
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
                {(selectedVariant?.images || productData.images || []).length >
                  4 && (
                  <div
                    className="col-span-4 overflow-x-auto flex gap-2 mt-2"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    {(selectedVariant?.images || productData.images || [])
                      .reduce((unique, image) => {
                        return unique.includes(image)
                          ? unique
                          : [...unique, image];
                      }, [])
                      .slice(4)
                      .map((image, index) => (
                        <div
                          key={`extra-${index}`}
                          onClick={() => setMainImage(image)}
                          className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 aspect-[4/4] min-w-[70px]"
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
                )}
              </div>
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 opacity-50 text-white p-1.5 rounded-full z-10 text-sm hover:opacity-75"
              >
                →
              </button>
            </div>
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
              {formatCurrency(
                selectedVariant?.offerPrice || productData.offerPrice || 0
              )}{" "}
              {selectedVariant?.price && (
                <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                  {formatCurrency(
                    selectedVariant?.price || productData.price || 0
                  )}
                </span>
              )}
            </p>
            <hr className="bg-gray-600 my-6" />
            <div>
              <label className="text-gray-600 font-medium">Màu sắc:</label>
              <div className="flex gap-2 mt-2">
                {getUniqueColors().map((color) => {
                  const colorCode = getColorCode(color);
                  return (
                    <label
                      key={color}
                      className={`flex items-center gap-1 cursor-pointer p-1 ${
                        selectedColor === color
                          ? "border-2 border-blue-500"
                          : "border border-gray-300"
                      } rounded-full`}
                    >
                      <input
                        type="radio"
                        name="color"
                        value={color}
                        checked={selectedColor === color}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="hidden"
                      />
                      <span
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: colorCode }}
                      ></span>
                      <span className="text-sm">{color}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            {getUniqueStorages().length > 0 && (
              <div className="mt-4">
                <label className="text-gray-600 font-medium">Dung lượng:</label>
                <div className="flex gap-2 mt-2">
                  {getUniqueStorages().map((storage) => (
                    <button
                      key={storage}
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-3 py-1 rounded ${
                        selectedStorage === storage
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="overflow-x-auto mt-4">
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
                      {selectedVariant?.stock > 0
                        ? selectedVariant.stock
                        : "Hết hàng"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-center mt-10 gap-4">
              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 text-gray-800/80 transition ${
                  selectedVariant?.stock > 0
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
              >
                Thêm Vào Giỏ Hàng
              </button>
              <button
                onClick={handleBuyNow}
                className={`w-full py-3.5 text-white transition ${
                  selectedVariant?.stock > 0
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-orange-300 cursor-not-allowed"
                }`}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
              >
                Mua Ngay
              </button>
            </div>
          </div>
        </div>

        {/* Rating và Comment Section */}
        <div className="mt-8 space-y-6">
          {/* Rating Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Đánh giá sản phẩm</h2>
              <div className="flex items-center gap-2">
                {renderStars(averageRating)}
                <span className="text-lg font-medium">({averageRating}/5)</span>
                <span className="text-gray-500">
                  • {productData.ratings?.length || 0} đánh giá
                </span>
              </div>
            </div>

            {hasPurchased && (
              <div className="space-y-4">
                {!showRatingForm && !existingRating && (
                  <button
                    onClick={() => setShowRatingForm(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Đánh giá sản phẩm
                  </button>
                )}

                {(showRatingForm || existingRating) && (
                  <form onSubmit={handleSubmitRating} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {existingRating
                          ? "Cập nhật đánh giá của bạn:"
                          : "Đánh giá:"}
                      </label>
                      <div className="flex items-center gap-2">
                        {renderStars(
                          rating || existingRating || 0,
                          (newRating) => setRating(newRating)
                        )}
                        <span className="text-sm text-gray-600">
                          ({rating || existingRating || 0}/5 sao)
                        </span>
                      </div>
                      {existingRating && (
                        <p className="text-sm text-gray-500 mt-1">
                          Đánh giá hiện tại: {existingRating} sao. Bạn có thể
                          cập nhật!
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        disabled={!hasPurchased}
                      >
                        {existingRating ? "Cập nhật đánh giá" : "Gửi đánh giá"}
                      </button>
                      {showRatingForm && !existingRating && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowRatingForm(false);
                            setRating(0);
                          }}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {!hasPurchased && (
              <p className="text-gray-500 italic">
                Bạn cần mua sản phẩm này để có thể đánh giá
              </p>
            )}
          </div>

          {/* Comment Section */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Bình luận từ khách hàng
            </h2>

            {hasPurchased && (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chia sẻ trải nghiệm của bạn:
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập bình luận của bạn về sản phẩm..."
                    rows="3"
                    disabled={!hasPurchased}
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  disabled={!hasPurchased}
                >
                  Gửi bình luận
                </button>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {productData.comments?.length > 0 ? (
                <>
                  {(showAllComments
                    ? productData.comments
                    : productData.comments.slice(0, 3)
                  ).map((commentItem, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {(commentItem.username || "A")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800">
                                {commentItem.username || "Khách hàng"}
                              </p>
                              {/* Hiển thị rating của user này */}
                              {(() => {
                                const userRating = productData.ratings?.find(
                                  (r) => r.userId === commentItem.userId
                                );
                                return userRating ? (
                                  <div className="flex items-center gap-1">
                                    {renderStars(userRating.rating)}
                                    <span className="text-xs text-gray-600">
                                      ({userRating.rating})
                                    </span>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                commentItem.createdAt
                              ).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 ml-10">
                        {commentItem.comment}
                      </p>

                      {/* Reply from seller */}
                      {commentItem.reply && (
                        <div className="ml-10 bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              S
                            </div>
                            <span className="text-sm font-medium text-orange-600">
                              Người bán
                            </span>
                            {commentItem.replyDate && (
                              <span className="text-xs text-gray-500">
                                •{" "}
                                {new Date(
                                  commentItem.replyDate
                                ).toLocaleDateString("vi-VN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm ml-8">
                            {commentItem.reply}
                          </p>
                        </div>
                      )}

                      {/* Reply button for seller */}
                      {!commentItem.reply && (
                        <div className="ml-10">
                          {/* Debug info */}
                          {console.log(
                            "Product userId:",
                            productData.userId,
                            "Current userId:",
                            userId
                          )}

                          {productData.userId === userId ? (
                            // Show reply form for seller
                            replyingTo === index ? (
                              <div className="mt-2 space-y-2">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded text-sm"
                                  placeholder="Nhập phản hồi của bạn..."
                                  rows="2"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleSubmitReply(commentItem._id)
                                    }
                                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                  >
                                    Gửi phản hồi
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyText("");
                                    }}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReplyingTo(index)}
                                className="text-sm text-blue-500 hover:text-blue-600"
                              >
                                Phản hồi
                              </button>
                            )
                          ) : (
                            // Show message for non-sellers
                            <p className="text-xs text-gray-400 italic">
                              Chỉ người bán mới có thể phản hồi
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {productData.comments.length > 3 && (
                    <button
                      onClick={() => setShowAllComments(!showAllComments)}
                      className="w-full py-2 text-blue-500 hover:text-blue-600 font-medium"
                    >
                      {showAllComments
                        ? "Ẩn bớt bình luận"
                        : `Xem thêm ${
                            productData.comments.length - 3
                          } bình luận`}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có bình luận nào</p>
                  <p className="text-sm">
                    Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          {productData?.relatedProducts?.length > 0 ? (
            <>
              <div className="flex flex-col items-center mb-4 mt-16">
                <p className="text-3xl font-medium">
                  Sản phẩm liên quan từ{" "}
                  <span className="font-medium text-orange-600">
                    {productData.category?.name}
                  </span>
                </p>
                <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
                {productData.relatedProducts
                  .slice(0, 10)
                  .map((product, index) => (
                    <ProductCard key={product._id || index} product={product} />
                  ))}
              </div>
            </>
          ) : (
            <div className="mt-16 mb-16 text-center">
              <p className="text-xl text-gray-600 mb-2">
                Không có sản phẩm liên quan trong danh mục{" "}
                <span className="font-semibold text-orange-600">
                  {productData?.category?.name}
                </span>
              </p>
              <p className="text-gray-500 mb-6">
                Khám phá thêm các sản phẩm khác trong cửa hàng của chúng tôi
              </p>
            </div>
          )}
          <button
            onClick={() => router.push("/all-products")}
            className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      </div>
      <Footer />
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
