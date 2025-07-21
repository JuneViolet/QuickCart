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
    } catch (error) {
      console.error("Fetch Product Error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
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
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Add a Review</h2>
          <div className="mt-4 space-y-4">
            <form onSubmit={handleSubmitRating}>
              <div>
                <label>Rating:</label>
                <div className="inline-block ml-2">
                  {renderStars(rating || existingRating || 0, (newRating) =>
                    setRating(newRating)
                  )}
                </div>
                {existingRating && (
                  <p className="text-sm text-gray-500 mt-1">
                    Bạn đã đánh giá trước đó: {existingRating} sao. Bạn có thể
                    cập nhật!
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 mt-2"
                disabled={!hasPurchased}
              >
                Update Rating
              </button>
            </form>
            <form onSubmit={handleSubmitComment}>
              <div>
                <label>Comment:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="border p-2 w-full mt-2"
                  placeholder="Nhập bình luận của bạn..."
                  disabled={!hasPurchased}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 mt-2"
                disabled={!hasPurchased}
              >
                Add Comment
              </button>
            </form>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Comments</h2>
          {productData.comments?.length > 0 ? (
            productData.comments.map((comment, index) => (
              <div key={index} className="border p-4 mt-2">
                <p className="font-medium">
                  {comment.username || "Anonymous"} đã bình luận
                </p>
                <p>{comment.comment}</p>
                <p>
                  Posted on: {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
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
