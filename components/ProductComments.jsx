"use client";

import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { assets } from "@/assets/assets";

const ProductComments = ({
  productId,
  productUserId,
  comments,
  ratings,
  hasPurchased,
  onCommentUpdate,
  existingRating,
}) => {
  const { getToken, userId } = useAuth();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(existingRating || 0);
  const [showAllComments, setShowAllComments] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const renderStars = (ratingValue, onClick = null) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Image
            key={index}
            className={`h-4 w-4 ${
              onClick
                ? "cursor-pointer hover:scale-110 transition-transform"
                : ""
            }`}
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
    if (rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn đánh giá từ 1 đến 5 sao!");
      return;
    }

    try {
      const token = await getToken();

      // Gửi cả comment và rating cùng lúc
      const commentData = { productId, comment, rating };
      const res = await axios.post(
        `/api/product/comment-with-rating`,
        commentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        onCommentUpdate();
        setComment("");
        setRating(existingRating || 0); // Reset về rating hiện tại hoặc 0
        toast.success("Đã gửi bình luận và đánh giá thành công!");
      } else {
        toast.error("Gửi bình luận thất bại: " + res.data.message);
      }
    } catch (error) {
      console.error("Comment submission error:", error);
      toast.error(
        "Lỗi gửi bình luận: " + (error.response?.data?.message || error.message)
      );
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
        productId,
        commentId,
        reply: replyText,
      };
      const res = await axios.post(`/api/product/reply`, replyData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        onCommentUpdate();
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

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Bình luận từ khách hàng</h2>

      {hasPurchased && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá sản phẩm:
              </label>
              <div className="flex items-center gap-2">
                {renderStars(rating, setRating)}
                <span className="text-sm text-gray-600">
                  {rating > 0 ? `(${rating}/5 sao)` : "(Chưa chọn)"}
                </span>
                {existingRating && (
                  <span className="text-xs text-blue-600">
                    (Đánh giá hiện tại: {existingRating}/5)
                  </span>
                )}
              </div>
            </div>
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
          </div>
          <button
            type="submit"
            className="mt-3 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            disabled={!hasPurchased}
          >
            Gửi bình luận & đánh giá
          </button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.length > 0 ? (
          <>
            {(showAllComments ? comments : comments.slice(0, 3)).map(
              (commentItem, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {(commentItem.username || "A").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800">
                            {commentItem.username || "Khách hàng"}
                          </p>
                          {/* Hiển thị rating của user này */}
                          {(() => {
                            const userRating = ratings?.find(
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
                          {new Date(commentItem.createdAt).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
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
                          TT
                        </div>
                        <span className="text-sm font-medium text-orange-600">
                          TechTrend
                        </span>
                        {commentItem.replyDate && (
                          <span className="text-xs text-gray-500">
                            •{" "}
                            {new Date(commentItem.replyDate).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
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
                      {productUserId === userId ? (
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
              )
            )}

            {comments.length > 3 && (
              <button
                onClick={() => setShowAllComments(!showAllComments)}
                className="w-full py-2 text-blue-500 hover:text-blue-600 font-medium"
              >
                {showAllComments
                  ? "Ẩn bớt bình luận"
                  : `Xem thêm ${comments.length - 3} bình luận`}
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
  );
};

export default ProductComments;
