"use client";

import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { assets } from "@/assets/assets";

const ProductRating = ({
  productId,
  hasPurchased,
  existingRating,
  averageRating,
  totalRatings,
  onRatingUpdate,
}) => {
  const { getToken } = useAuth();
  const [rating, setRating] = useState(existingRating || 0);
  const [showRatingForm, setShowRatingForm] = useState(false);

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
      const reviewData = { productId, rating };
      const res = await axios.put(
        `/api/product/review/${productId}`,
        reviewData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        onRatingUpdate();
        setRating(0);
        toast.success("Rating updated successfully!");
      } else {
        toast.error("Failed to update rating");
      }
    } catch (error) {
      toast.error("Error updating rating: " + error.message);
    }
  };

  return (
    <div
      className="bg-gray-50 p-6 rounded-lg"
      style={{ maxWidth: "600px", marginRight: "0 auto" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Đánh giá sản phẩm</h2>
        <div className="flex items-center gap-2">
          {renderStars(averageRating)}
          <span className="text-lg font-medium">({averageRating}/5)</span>
          <span className="text-gray-500">• {totalRatings || 0} đánh giá</span>
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
                  {existingRating ? "Cập nhật đánh giá của bạn:" : "Đánh giá:"}
                </label>
                <div className="flex items-center gap-2">
                  {renderStars(rating || existingRating || 0, (newRating) =>
                    setRating(newRating)
                  )}
                  <span className="text-sm text-gray-600">
                    ({rating || existingRating || 0}/5 sao)
                  </span>
                </div>
                {existingRating && (
                  <p className="text-sm text-gray-500 mt-1">
                    Đánh giá hiện tại: {existingRating} sao. Bạn có thể cập
                    nhật!
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
  );
};

export default ProductRating;
