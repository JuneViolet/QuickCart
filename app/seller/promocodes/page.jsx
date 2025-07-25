"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { assets } from "@/assets/assets";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";

const Promocodes = () => {
  const { getToken, isLoaded } = useAuth();
  const [promocodes, setPromocodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoOrdersCount, setPromoOrdersCount] = useState({}); // Thêm state để lưu số đơn hàng sử dụng mã
  const [newPromoData, setNewPromoData] = useState({
    code: "",
    description: "",
    discount: "",
    discountType: "percentage",
    expiresAt: "",
    maxUses: "",
    isActive: true,
    minOrderValue: "0", // Khởi tạo với giá trị hợp lệ
    maxOrderValue: "", // Để trống, sẽ xử lý thành Infinity
  });
  const [editPromoData, setEditPromoData] = useState({
    code: "",
    description: "",
    discount: "",
    discountType: "percentage",
    expiresAt: "",
    maxUses: "",
    isActive: true,
    minOrderValue: "0",
    maxOrderValue: "",
  });

  const fetchSellerPromocodes = async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Không lấy được token. Hãy đăng nhập lại.");
        return;
      }

      const { data } = await axios.get("/api/promos/manage", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        console.log("Fetched Promocodes:", data.promos);
        setPromocodes(data.promos || []);
      } else {
        toast.error(data.message || "Không thể tải mã giảm giá");
      }
    } catch (error) {
      console.error("Lỗi khi lấy mã giảm giá:", error);
      toast.error("Lỗi server. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra số đơn hàng sử dụng mã giảm giá
  const checkPromoOrdersCount = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get("/api/promos/check-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setPromoOrdersCount(data.promoOrdersCount || {});
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra đơn hàng sử dụng mã:", error);
      // Không hiển thị lỗi để tránh làm phiền user
    }
  };

  const handleAddPromo = async (e) => {
    e.preventDefault();
    const minValue = parseFloat(newPromoData.minOrderValue);
    const maxValue = newPromoData.maxOrderValue
      ? parseFloat(newPromoData.maxOrderValue)
      : Infinity;
    if (minValue > maxValue) {
      toast.error("Giá trị tối thiểu không được lớn hơn giá trị tối đa.");
      return;
    }
    try {
      const token = await getToken();
      const payload = {
        ...newPromoData,
        discount: parseFloat(newPromoData.discount),
        maxUses: newPromoData.maxUses ? parseInt(newPromoData.maxUses, 10) : "",
        minOrderValue: minValue,
        maxOrderValue: maxValue,
      };
      console.log("Sending add data:", payload);
      const { data } = await axios.post("/api/promos/manage", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message);
        setIsAdding(false);
        setNewPromoData({
          code: "",
          description: "",
          discount: "",
          discountType: "percentage",
          expiresAt: "",
          maxUses: "",
          isActive: true,
          minOrderValue: "0",
          maxOrderValue: "",
        });
        fetchSellerPromocodes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleEditPromo = (promocode) => {
    setEditingPromo(promocode._id);
    setEditPromoData({
      code: promocode.code || "",
      description: promocode.description || "",
      discount: promocode.discount || "",
      discountType: promocode.discountType || "percentage",
      expiresAt: promocode.expiresAt
        ? new Date(promocode.expiresAt).toISOString().split("T")[0]
        : "",
      maxUses: promocode.maxUses || "",
      isActive: promocode.isActive !== undefined ? promocode.isActive : true,
      minOrderValue: promocode.minOrderValue
        ? promocode.minOrderValue.toString()
        : "0",
      maxOrderValue:
        promocode.maxOrderValue !== Infinity
          ? promocode.maxOrderValue.toString()
          : "",
    });
  };

  const handleUpdatePromo = async (e) => {
    e.preventDefault();
    const minValue = parseFloat(editPromoData.minOrderValue);
    const maxValue = editPromoData.maxOrderValue
      ? parseFloat(editPromoData.maxOrderValue)
      : Infinity;
    if (minValue > maxValue) {
      toast.error("Giá trị tối thiểu không được lớn hơn giá trị tối đa.");
      return;
    }
    try {
      const token = await getToken();
      const payload = {
        ...editPromoData,
        discount: parseFloat(editPromoData.discount),
        maxUses: editPromoData.maxUses
          ? parseInt(editPromoData.maxUses, 10)
          : "",
        minOrderValue: minValue,
        maxOrderValue: maxValue,
      };
      console.log("Sending update data:", payload);
      const { data } = await axios.put("/api/promos/manage", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message);
        setEditingPromo(null);
        fetchSellerPromocodes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDeletePromo = async (code) => {
    // Kiểm tra xem mã giảm giá có được sử dụng trong đơn hàng hay không
    const orderCount = promoOrdersCount[code] || 0;

    if (orderCount > 0) {
      toast.error(
        `❌ Không thể xóa mã giảm giá này!\n\n` +
          `🛒 Mã "${code}" đã được sử dụng trong ${orderCount} đơn hàng.\n\n` +
          `💡 Gợi ý: Bạn có thể tắt mã giảm giá thay vì xóa để khách hàng không thể sử dụng mã mới.`,
        {
          duration: 8000,
          style: {
            maxWidth: "500px",
          },
        }
      );
      return;
    }

    const confirmMessage =
      `⚠️ Xác nhận xóa mã giảm giá\n\n` +
      `Bạn có chắc chắn muốn xóa mã "${code}" không?\n\n` +
      `❗ Hành động này không thể hoàn tác!`;

    if (confirm(confirmMessage)) {
      try {
        const token = await getToken();
        const { data } = await axios.delete("/api/promos/manage", {
          headers: { Authorization: `Bearer ${token}` },
          data: { code },
        });

        if (data.success) {
          toast.success(
            "✅ " + (data.message || "Đã xóa mã giảm giá thành công!")
          );
          fetchSellerPromocodes();
          checkPromoOrdersCount(); // Cập nhật lại số đơn hàng
        } else {
          toast.error("❌ " + (data.message || "Xóa mã giảm giá thất bại"));
        }
      } catch (error) {
        toast.error(
          "❌ Lỗi xóa mã: " + (error.response?.data?.message || error.message)
        );
      }
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewPromoData({
      code: "",
      description: "",
      discount: "",
      discountType: "percentage",
      expiresAt: "",
      maxUses: "",
      isActive: true,
      minOrderValue: "0",
      maxOrderValue: "",
    });
  };

  const handleCancelEdit = () => {
    setEditingPromo(null);
    setEditPromoData({
      code: "",
      description: "",
      discount: "",
      discountType: "percentage",
      expiresAt: "",
      maxUses: "",
      isActive: true,
      minOrderValue: "0",
      maxOrderValue: "",
    });
  };

  useEffect(() => {
    if (isLoaded) {
      const fetchData = async () => {
        await Promise.all([fetchSellerPromocodes(), checkPromoOrdersCount()]);
      };
      fetchData();
    }
  }, [isLoaded]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  return (
    <div className="flex-1 h-screen overflow-scroll flex flex-col bg-gray-50">
      {loading ? (
        <Loading />
      ) : (
        <div className="md:p-8 p-4">
          {/* Header với tiêu đề và nút thêm mới */}
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Quản lý mã giảm giá
              </h1>
              <p className="text-gray-600 mt-1">
                {promocodes.length} mã giảm giá được tìm thấy
              </p>
              <p className="text-sm text-gray-500 mt-1">
                💡 <strong>Lưu ý:</strong> Mã giảm giá đã được sử dụng trong đơn
                hàng sẽ không thể xóa được. Bạn có thể tắt mã thay vì xóa.
              </p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Thêm mã mới
            </button>
          </div>

          {/* Form thêm mã mới - Hiển thị như modal */}
          {isAdding && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Thêm mã giảm giá mới
                  </h2>
                </div>

                <form onSubmit={handleAddPromo} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cột trái */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mã giảm giá *
                        </label>
                        <input
                          type="text"
                          placeholder="SUMMER20"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={newPromoData.code}
                          onChange={(e) =>
                            setNewPromoData({
                              ...newPromoData,
                              code: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mô tả
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Mô tả ngắn về mã giảm giá"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={newPromoData.description}
                          onChange={(e) =>
                            setNewPromoData({
                              ...newPromoData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại giảm giá *
                          </label>
                          <select
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newPromoData.discountType}
                            onChange={(e) =>
                              setNewPromoData({
                                ...newPromoData,
                                discountType: e.target.value,
                              })
                            }
                          >
                            <option value="percentage">Phần trăm (%)</option>
                            <option value="fixed">Số tiền cố định (₫)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá trị giảm *
                          </label>
                          <input
                            type="number"
                            placeholder={
                              newPromoData.discountType === "percentage"
                                ? "0-100"
                                : "0"
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newPromoData.discount}
                            onChange={(e) =>
                              setNewPromoData({
                                ...newPromoData,
                                discount: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cột phải */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hạn sử dụng
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={newPromoData.expiresAt}
                          onChange={(e) =>
                            setNewPromoData({
                              ...newPromoData,
                              expiresAt: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số lần sử dụng tối đa
                        </label>
                        <input
                          type="number"
                          placeholder="Không giới hạn"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={newPromoData.maxUses}
                          onChange={(e) =>
                            setNewPromoData({
                              ...newPromoData,
                              maxUses: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá trị tối thiểu (₫)
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newPromoData.minOrderValue}
                            onChange={(e) =>
                              setNewPromoData({
                                ...newPromoData,
                                minOrderValue: e.target.value,
                              })
                            }
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá trị tối đa (₫)
                          </label>
                          <input
                            type="number"
                            placeholder="Không giới hạn"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newPromoData.maxOrderValue}
                            onChange={(e) =>
                              setNewPromoData({
                                ...newPromoData,
                                maxOrderValue: e.target.value,
                              })
                            }
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trạng thái
                        </label>
                        <select
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={newPromoData.isActive}
                          onChange={(e) =>
                            setNewPromoData({
                              ...newPromoData,
                              isActive: e.target.value === "true",
                            })
                          }
                        >
                          <option value={true}>Hoạt động</option>
                          <option value={false}>Không hoạt động</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleCancelAdd}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                    >
                      Thêm mã
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Form chỉnh sửa mã - Hiển thị như modal */}
          {editingPromo && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Chỉnh sửa mã giảm giá
                  </h2>
                </div>

                <form onSubmit={handleUpdatePromo} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cột trái */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mã giảm giá *
                        </label>
                        <input
                          type="text"
                          placeholder="SUMMER20"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                          value={editPromoData.code}
                          onChange={(e) =>
                            setEditPromoData({
                              ...editPromoData,
                              code: e.target.value,
                            })
                          }
                          disabled
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Mã giảm giá không thể thay đổi
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mô tả
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Mô tả ngắn về mã giảm giá"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={editPromoData.description}
                          onChange={(e) =>
                            setEditPromoData({
                              ...editPromoData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại giảm giá *
                          </label>
                          <select
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editPromoData.discountType}
                            onChange={(e) =>
                              setEditPromoData({
                                ...editPromoData,
                                discountType: e.target.value,
                              })
                            }
                          >
                            <option value="percentage">Phần trăm (%)</option>
                            <option value="fixed">Số tiền cố định (₫)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá trị giảm *
                          </label>
                          <input
                            type="number"
                            placeholder={
                              editPromoData.discountType === "percentage"
                                ? "0-100"
                                : "0"
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editPromoData.discount}
                            onChange={(e) =>
                              setEditPromoData({
                                ...editPromoData,
                                discount: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cột phải */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hạn sử dụng
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={editPromoData.expiresAt}
                          onChange={(e) =>
                            setEditPromoData({
                              ...editPromoData,
                              expiresAt: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số lần sử dụng tối đa
                        </label>
                        <input
                          type="number"
                          placeholder="Không giới hạn"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={editPromoData.maxUses}
                          onChange={(e) =>
                            setEditPromoData({
                              ...editPromoData,
                              maxUses: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá trị tối thiểu (₫)
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editPromoData.minOrderValue}
                            onChange={(e) =>
                              setEditPromoData({
                                ...editPromoData,
                                minOrderValue: e.target.value,
                              })
                            }
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá trị tối đa (₫)
                          </label>
                          <input
                            type="number"
                            placeholder="Không giới hạn"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editPromoData.maxOrderValue}
                            onChange={(e) =>
                              setEditPromoData({
                                ...editPromoData,
                                maxOrderValue: e.target.value,
                              })
                            }
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trạng thái
                        </label>
                        <select
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={editPromoData.isActive}
                          onChange={(e) =>
                            setEditPromoData({
                              ...editPromoData,
                              isActive: e.target.value === "true",
                            })
                          }
                        >
                          <option value={true}>Hoạt động</option>
                          <option value={false}>Không hoạt động</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Danh sách mã giảm giá */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {promocodes.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Chưa có mã giảm giá
                </h3>
                <p className="text-gray-500 mb-4">
                  Bắt đầu bằng cách tạo mã giảm giá đầu tiên của bạn
                </p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Thêm mã mới
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {promocodes.map((promocode) => (
                  <div
                    key={promocode._id}
                    className={`p-5 hover:bg-gray-50 transition-colors ${
                      editingPromo === promocode._id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {/* Biểu tượng và thông tin cơ bản */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-green-50 rounded-lg p-3 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                            />
                          </svg>
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-semibold text-lg bg-blue-50 text-blue-700 px-3 py-1 rounded-md">
                              {promocode.code}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                promocode.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {promocode.isActive ? "Đang hoạt động" : "Đã tắt"}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-3">
                            {promocode.description || "Không có mô tả"}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Giảm:</span>{" "}
                              <span className="font-medium">
                                {promocode.discountType === "percentage"
                                  ? `${promocode.discount}%`
                                  : `${formatCurrency(promocode.discount)}`}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-500">Hạn:</span>{" "}
                              <span className="font-medium">
                                {promocode.expiresAt
                                  ? new Date(
                                      promocode.expiresAt
                                    ).toLocaleDateString()
                                  : "Không hạn"}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-500">
                                Đơn tối thiểu:
                              </span>{" "}
                              <span className="font-medium">
                                {formatCurrency(promocode.minOrderValue)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div className="flex gap-2 md:self-center">
                        <button
                          onClick={() => handleEditPromo(promocode)}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span>Sửa</span>
                        </button>

                        <button
                          onClick={() => handleDeletePromo(promocode.code)}
                          disabled={promoOrdersCount[promocode.code] > 0}
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors relative group ${
                            promoOrdersCount[promocode.code] > 0
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                          title={
                            promoOrdersCount[promocode.code] > 0
                              ? `❌ Không thể xóa - Mã đã được sử dụng trong ${
                                  promoOrdersCount[promocode.code]
                                } đơn hàng`
                              : "🗑️ Xóa mã giảm giá"
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            {promoOrdersCount[promocode.code] > 0
                              ? "Đã sử dụng"
                              : "Xóa"}
                          </span>
                          {/* Tooltip cho mobile */}
                          {promoOrdersCount[promocode.code] > 0 && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                              Đã dùng trong {promoOrdersCount[promocode.code]}{" "}
                              đơn
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Promocodes;
