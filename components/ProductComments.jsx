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
  productData, // Thêm productData để lấy thông tin sản phẩm
}) => {
  const { getToken, userId } = useAuth();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(existingRating || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(6); // 6 bình luận mỗi trang để hiển thị 2x3
  const [showAllComments, setShowAllComments] = useState(false); // 🔥 State để kiểm soát hiển thị
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");

  // Tính toán dữ liệu thực từ ratings
  const totalRatings = ratings?.length || 0;
  const averageRating =
    totalRatings > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(
          1
        )
      : 0;

  // Tính toán pagination (phải khai báo trước khi sử dụng)
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  // 🎯 Tính toán hiển thị bình luận với giới hạn
  const INITIAL_COMMENTS_COUNT = 4; // Hiển thị 4 bình luận đầu tiên
  const displayedComments = showAllComments
    ? comments.slice(indexOfFirstComment, indexOfLastComment) // Hiển thị theo pagination
    : comments.slice(0, INITIAL_COMMENTS_COUNT); // Chỉ hiển thị 4 bình luận đầu

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
    if (!comment.trim()) {
      toast.error("Vui lòng nhập bình luận!");
      return;
    }
    try {
      const token = await getToken();
      if (rating > 0) {
        // Nếu có rating, gửi cả comment và rating
        const ratingData = { productId, rating, comment };
        const res = await axios.post(
          `/api/product/comment-with-rating`,
          ratingData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          onCommentUpdate();
          setComment("");
          setRating(existingRating || 0);
          toast.success(
            existingRating
              ? "Đã cập nhật bình luận và đánh giá!"
              : "Đã gửi bình luận và đánh giá thành công!"
          );
        } else {
          toast.error("Gửi bình luận thất bại: " + res.data.message);
        }
      } else {
        // Nếu không có rating, chỉ gửi comment
        const commentData = { productId, comment };
        const res = await axios.post(`/api/product/comment`, commentData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          onCommentUpdate();
          setComment("");
          toast.success(
            existingRating
              ? "Đã cập nhật bình luận!"
              : "Đã gửi bình luận thành công!"
          );
        } else {
          toast.error("Gửi bình luận thất bại: " + res.data.message);
        }
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

  const handleEditReply = async (commentId) => {
    if (!editReplyText.trim()) {
      toast.error("Vui lòng nhập phản hồi!");
      return;
    }
    try {
      const token = await getToken();
      const replyData = {
        productId,
        reply: editReplyText,
      };
      const res = await axios.put(
        `/api/product/reply/${commentId}`,
        replyData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        onCommentUpdate();
        setEditReplyText("");
        setEditingReply(null);
        toast.success("Đã cập nhật phản hồi!");
      } else {
        toast.error("Cập nhật phản hồi thất bại: " + res.data.message);
      }
    } catch (error) {
      console.error("Edit reply error:", error);
      toast.error(
        "Lỗi cập nhật phản hồi: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleDeleteReply = async (commentId) => {
    if (!confirm("Bạn có chắc muốn xóa phản hồi này?")) {
      return;
    }
    try {
      const token = await getToken();
      const res = await axios.delete(
        `/api/product/reply/${commentId}?productId=${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        onCommentUpdate();
        toast.success("Đã xóa phản hồi!");
      } else {
        toast.error("Xóa phản hồi thất bại: " + res.data.message);
      }
    } catch (error) {
      console.error("Delete reply error:", error);
      toast.error(
        "Lỗi xóa phản hồi: " + (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Đánh giá {productData?.name || "sản phẩm"}
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-2xl font-bold text-orange-500">
              {averageRating}
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => {
                const filled = i < Math.floor(parseFloat(averageRating));
                const halfFilled =
                  i === Math.floor(parseFloat(averageRating)) &&
                  parseFloat(averageRating) % 1 >= 0.5;

                return (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      filled || halfFilled
                        ? "text-orange-400 fill-current"
                        : "text-gray-300 fill-current"
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                );
              })}
            </div>
            <span className="text-sm text-gray-500">/5</span>
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium">{totalRatings}</span> đánh giá
          </div>
        </div>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rating Breakdown */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count =
              ratings?.filter((r) => Math.floor(r.rating) === star).length || 0;
            const percentage =
              totalRatings > 0 ? (count / totalRatings) * 100 : 0;

            return (
              <div key={star} className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 w-2">{star}</span>
                <svg
                  className="w-4 h-4 text-orange-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="flex flex-col justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {totalRatings}
            </div>
            <div className="text-gray-600">khách hàng đã đánh giá</div>
            <div className="text-sm text-gray-500 mt-2">
              Điểm trung bình:{" "}
              <span className="font-medium">{averageRating}/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form bình luận */}
      {hasPurchased && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-700 mb-3">
            {existingRating
              ? "Cập nhật đánh giá của bạn"
              : "Chia sẻ trải nghiệm của bạn"}
          </h4>
          {existingRating && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Bạn đã đánh giá sản phẩm này. Gửi lại sẽ cập nhật đánh giá cũ.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Đánh giá của bạn:
              </label>
              <div className="flex items-center gap-2">
                {renderStars(rating, setRating)}
                <span className="text-sm text-gray-600 ml-2">
                  {rating > 0 ? `${rating}/5 sao` : "Chưa chọn"}
                </span>
                {existingRating && (
                  <span className="text-xs text-blue-600">
                    (Hiện tại: {existingRating}/5)
                  </span>
                )}
              </div>
            </div>
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                rows="3"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {existingRating
                ? rating > 0
                  ? "Cập nhật bình luận & đánh giá"
                  : "Cập nhật bình luận"
                : rating > 0
                ? "Gửi bình luận & đánh giá"
                : "Gửi bình luận"}
            </button>
          </form>
        </div>
      )}

      {/* Danh sách bình luận */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          <>
            {/* Grid layout cho bình luận */}
            <div className="space-y-4">
              {displayedComments.map((commentItem, index) => (
                <div
                  key={commentItem._id || index}
                  className="border-b border-gray-100 pb-4 last:border-b-0"
                >
                  {/* Header với avatar và thông tin */}
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {(commentItem.username || "A").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {commentItem.username || "Khách hàng"}
                          </h5>
                          {/* Hiển thị rating */}
                          {(() => {
                            const userRating = ratings?.find(
                              (r) => r.userId === commentItem.userId
                            );
                            return userRating ? (
                              <div className="flex items-center space-x-1 mt-1">
                                {renderStars(userRating.rating)}
                                <span className="text-xs text-gray-500 ml-1">
                                  {userRating.rating}/5
                                </span>
                              </div>
                            ) : null;
                          })()}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-green-600 text-xs">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Đã mua tại TechTrend
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(commentItem.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                            {commentItem.updatedAt &&
                              commentItem.updatedAt !==
                                commentItem.createdAt && (
                                <span className="ml-1 text-xs text-blue-500">
                                  • Đã chỉnh sửa
                                  {!commentItem.reply &&
                                    productUserId === userId && (
                                      <span className="ml-1 text-orange-500">
                                        (Phản hồi cũ đã bị xóa)
                                      </span>
                                    )}
                                </span>
                              )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nội dung bình luận */}
                  <div className="ml-13">
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      {commentItem.comment}
                    </p>

                    {/* Phản hồi từ seller */}
                    {commentItem.reply && (
                      <div
                        className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg"
                        style={{ width: "900px", maxWidth: "100%" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              AD
                            </div>
                            <span className="text-sm font-medium text-orange-600">
                              Tech Trend
                            </span>
                            {commentItem.replyDate && (
                              <span className="text-xs text-gray-500">
                                •{" "}
                                {new Date(
                                  commentItem.replyDate
                                ).toLocaleDateString("vi-VN", {
                                  month: "short",
                                  day: "numeric",
                                })}
                                {commentItem.replyUpdated && (
                                  <span className="ml-1 text-blue-500">
                                    • Đã chỉnh sửa
                                  </span>
                                )}
                              </span>
                            )}
                          </div>

                          {/* Edit/Delete buttons cho seller */}
                          {productUserId === userId && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setEditingReply(commentItem._id);
                                  setEditReplyText(commentItem.reply);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 p-1"
                                title="Chỉnh sửa phản hồi"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteReply(commentItem._id)
                                }
                                className="text-xs text-red-600 hover:text-red-800 p-1"
                                title="Xóa phản hồi"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>

                        {editingReply === commentItem._id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editReplyText}
                              onChange={(e) => setEditReplyText(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Chỉnh sửa phản hồi..."
                              rows="2"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditReply(commentItem._id)}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                Cập nhật
                              </button>
                              <button
                                onClick={() => {
                                  setEditingReply(null);
                                  setEditReplyText("");
                                }}
                                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 text-sm">
                            {commentItem.reply}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Reply button cho seller */}
                    {!commentItem.reply && productUserId === userId && (
                      <div className="mt-3">
                        {replyingTo === `${currentPage}-${index}` ? (
                          <div className="space-y-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Nhập phản hồi của bạn..."
                              rows="2"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleSubmitReply(commentItem._id)
                                }
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                Gửi
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setReplyingTo(`${currentPage}-${index}`)
                            }
                            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                          >
                            Phản hồi
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 🎯 Nút Xem thêm hoặc Pagination */}
            {!showAllComments && comments.length > INITIAL_COMMENTS_COUNT ? (
              // Hiển thị nút "Xem thêm" khi chưa mở rộng
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowAllComments(true)}
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  Xem thêm đánh giá ({comments.length - INITIAL_COMMENTS_COUNT}{" "}
                  đánh giá khác)
                </button>
              </div>
            ) : showAllComments ? (
              // Hiển thị pagination khi đã mở rộng
              <>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Trước
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                          currentPage === i + 1
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Sau
                    </button>
                  </div>
                )}

                {/* Nút Thu gọn */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => {
                      setShowAllComments(false);
                      setCurrentPage(1); // Reset về trang đầu
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    ↑ Thu gọn đánh giá
                  </button>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              Chưa có đánh giá nào
            </h4>
            <p className="text-gray-500">
              Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductComments;
