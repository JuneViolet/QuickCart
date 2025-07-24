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
    if (confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
      try {
        const token = await getToken();
        const { data } = await axios.delete("/api/promos/manage", {
          headers: { Authorization: `Bearer ${token}` },
          data: { code },
        });

        if (data.success) {
          toast.success(data.message);
          fetchSellerPromocodes();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
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
      fetchSellerPromocodes();
    }
  }, [isLoaded]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  return (
    <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
      {loading ? (
        <Loading />
      ) : (
        <div className="md:p-10 p-4 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Mã Giảm Giá</h2>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Thêm Mã Mới
            </button>
          </div>

          {/* Form thêm mã mới */}
          {isAdding && (
            <div className="mt-6 max-w-lg">
              <h2 className="text-lg font-medium mb-4">Thêm Mã Giảm Giá</h2>
              <form onSubmit={handleAddPromo} className="space-y-5">
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="new-code">
                    Mã Giảm Giá
                  </label>
                  <input
                    id="new-code"
                    type="text"
                    placeholder="Nhập mã"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    onChange={(e) =>
                      setNewPromoData({ ...newPromoData, code: e.target.value })
                    }
                    value={newPromoData.code}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    className="text-base font-medium"
                    htmlFor="new-description"
                  >
                    Mô Tả
                  </label>
                  <textarea
                    id="new-description"
                    rows={4}
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
                    placeholder="Nhập mô tả"
                    onChange={(e) =>
                      setNewPromoData({
                        ...newPromoData,
                        description: e.target.value,
                      })
                    }
                    value={newPromoData.description}
                  />
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="new-discount-type"
                    >
                      Loại Giảm Giá
                    </label>
                    <select
                      id="new-discount-type"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setNewPromoData({
                          ...newPromoData,
                          discountType: e.target.value,
                        })
                      }
                      value={newPromoData.discountType}
                    >
                      <option value="percentage">Phần trăm</option>
                      <option value="fixed">Số tiền cố định</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="new-discount"
                    >
                      Giảm Giá
                    </label>
                    <input
                      id="new-discount"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setNewPromoData({
                          ...newPromoData,
                          discount: e.target.value,
                        })
                      }
                      value={newPromoData.discount}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="new-expiresAt"
                    >
                      Hạn Sử Dụng
                    </label>
                    <input
                      id="new-expiresAt"
                      type="date"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setNewPromoData({
                          ...newPromoData,
                          expiresAt: e.target.value,
                        })
                      }
                      value={newPromoData.expiresAt}
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="new-maxUses"
                    >
                      Số Lần Sử Dụng Tối Đa
                    </label>
                    <input
                      id="new-maxUses"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setNewPromoData({
                          ...newPromoData,
                          maxUses: e.target.value,
                        })
                      }
                      value={newPromoData.maxUses}
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="new-minOrderValue"
                    >
                      Giá trị tối thiểu (VND)
                    </label>
                    <input
                      id="new-minOrderValue"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setNewPromoData({
                          ...newPromoData,
                          minOrderValue: e.target.value,
                        })
                      }
                      value={newPromoData.minOrderValue}
                      min="0"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="new-maxOrderValue"
                    >
                      Giá trị tối đa (VND)
                    </label>
                    <input
                      id="new-maxOrderValue"
                      type="number"
                      placeholder="Không giới hạn"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setNewPromoData({
                          ...newPromoData,
                          maxOrderValue: e.target.value,
                        })
                      }
                      value={newPromoData.maxOrderValue}
                      min="0"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="new-isActive"
                    >
                      Trạng Thái
                    </label>
                    <select
                      id="new-isActive"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setNewPromoData({
                          ...newPromoData,
                          isActive: e.target.value === "true",
                        })
                      }
                      value={newPromoData.isActive}
                    >
                      <option value={true}>Hoạt động</option>
                      <option value={false}>Không hoạt động</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-green-600 text-white font-medium rounded"
                  >
                    THÊM
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAdd}
                    className="px-8 py-2.5 bg-gray-500 text-white font-medium rounded"
                  >
                    HỦY
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Form chỉnh sửa mã */}
          {editingPromo && (
            <div className="mt-6 max-w-lg">
              <h2 className="text-lg font-medium mb-4">
                Chỉnh Sửa Mã Giảm Giá
              </h2>
              <form onSubmit={handleUpdatePromo} className="space-y-5">
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="edit-code">
                    Mã Giảm Giá
                  </label>
                  <input
                    id="edit-code"
                    type="text"
                    placeholder="Nhập mã"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    onChange={(e) =>
                      setEditPromoData({
                        ...editPromoData,
                        code: e.target.value,
                      })
                    }
                    value={editPromoData.code}
                    required
                    disabled
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    className="text-base font-medium"
                    htmlFor="edit-description"
                  >
                    Mô Tả
                  </label>
                  <textarea
                    id="edit-description"
                    rows={4}
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
                    placeholder="Nhập mô tả"
                    onChange={(e) =>
                      setEditPromoData({
                        ...editPromoData,
                        description: e.target.value,
                      })
                    }
                    value={editPromoData.description}
                  />
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-discount-type"
                    >
                      Loại Giảm Giá
                    </label>
                    <select
                      id="edit-discount-type"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setEditPromoData({
                          ...editPromoData,
                          discountType: e.target.value,
                        })
                      }
                      value={editPromoData.discountType}
                    >
                      <option value="percentage">Phần trăm</option>
                      <option value="fixed">Số tiền cố định</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-discount"
                    >
                      Giảm Giá
                    </label>
                    <input
                      id="edit-discount"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setEditPromoData({
                          ...editPromoData,
                          discount: e.target.value,
                        })
                      }
                      value={editPromoData.discount}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-expiresAt"
                    >
                      Hạn Sử Dụng
                    </label>
                    <input
                      id="edit-expiresAt"
                      type="date"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setEditPromoData({
                          ...editPromoData,
                          expiresAt: e.target.value,
                        })
                      }
                      value={editPromoData.expiresAt}
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-maxUses"
                    >
                      Số Lần Sử Dụng Tối Đa
                    </label>
                    <input
                      id="edit-maxUses"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setEditPromoData({
                          ...editPromoData,
                          maxUses: e.target.value,
                        })
                      }
                      value={editPromoData.maxUses}
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-minOrderValue"
                    >
                      Giá trị tối thiểu (VND)
                    </label>
                    <input
                      id="edit-minOrderValue"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setEditPromoData({
                          ...editPromoData,
                          minOrderValue: e.target.value,
                        })
                      }
                      value={editPromoData.minOrderValue}
                      min="0"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-maxOrderValue"
                    >
                      Giá trị tối đa (VND)
                    </label>
                    <input
                      id="edit-maxOrderValue"
                      type="number"
                      placeholder="Không giới hạn"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setEditPromoData({
                          ...editPromoData,
                          maxOrderValue: e.target.value,
                        })
                      }
                      value={editPromoData.maxOrderValue}
                      min="0"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-isActive"
                    >
                      Trạng Thái
                    </label>
                    <select
                      id="edit-isActive"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setEditPromoData({
                          ...editPromoData,
                          isActive: e.target.value === "true",
                        })
                      }
                      value={editPromoData.isActive}
                    >
                      <option value={true}>Hoạt động</option>
                      <option value={false}>Không hoạt động</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded"
                  >
                    CẬP NHẬT
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-8 py-2.5 bg-gray-500 text-white font-medium rounded"
                  >
                    HỦY
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="max-w-4xl rounded-md">
            {promocodes.length === 0 ? (
              <p className="text-gray-500">Không tìm thấy mã giảm giá nào</p>
            ) : (
              promocodes.map((promocode) => (
                <div
                  key={promocode._id}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300"
                >
                  <div className="flex-1 flex gap-5 max-w-80">
                    {assets.coupon_icon && (
                      <Image
                        className="max-w-16 max-h-16 object-cover"
                        src={assets.coupon_icon}
                        alt="coupon_icon"
                      />
                    )}
                    <p className="flex flex-col gap-3">
                      <span className="font-medium">{promocode.code}</span>
                      <span>{promocode.description || "Không có mô tả"}</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-medium my-auto">
                      Giảm:{" "}
                      {promocode.discountType === "percentage"
                        ? `${promocode.discount}%`
                        : formatCurrency(promocode.discount)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="flex flex-col">
                      <span>
                        Hạn sử dụng:{" "}
                        {promocode.expiresAt
                          ? new Date(promocode.expiresAt).toLocaleDateString()
                          : "Không có"}
                      </span>
                      <span>
                        Trạng thái:{" "}
                        {promocode.isActive ? "Hoạt động" : "Không hoạt động"}
                      </span>
                      <span>
                        Giá trị đơn: {formatCurrency(promocode.minOrderValue)} -{" "}
                        {promocode.maxOrderValue === Infinity
                          ? "Không giới hạn"
                          : formatCurrency(promocode.maxOrderValue)}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPromo(promocode)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeletePromo(promocode.code)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* <Footer /> */}
    </div>
  );
};

export default Promocodes;
