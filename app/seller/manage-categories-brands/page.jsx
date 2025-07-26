"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

const ManageCategoriesBrands = () => {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: null,
    categoryIds: [],
  });
  const [editingItem, setEditingItem] = useState(null);
  const [selectedType, setSelectedType] = useState("category");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedBrand, setExpandedBrand] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const [catRes, brandRes] = await Promise.all([
        axios.get("/api/seller/manage", {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: "categories" },
        }),
        axios.get("/api/seller/manage", {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: "brands" },
        }),
      ]);
      if (catRes.data.success) setCategories(catRes.data.items);
      if (brandRes.data.success) setBrands(brandRes.data.items);
    } catch {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    if (formData.logo && typeof formData.logo === "object") {
      URL.revokeObjectURL(URL.createObjectURL(formData.logo));
    }
    setFormData({ name: "", description: "", logo: null, categoryIds: [] });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.size > 2 * 1024 * 1024) {
      return toast.error("Logo tối đa 2 MB");
    }
    setFormData({ ...formData, logo: file });
  };

  // Xử lý drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        return toast.error("Chỉ chấp nhận file ảnh");
      }
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("Logo tối đa 2 MB");
      }
      setFormData({ ...formData, logo: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Tên không được để trống");

    try {
      setActionLoading(true);
      const token = await getToken();
      const form = new FormData();
      form.append("type", selectedType);
      form.append("name", formData.name);
      form.append("description", formData.description);
      if (selectedType === "brand") {
        if (formData.logo) {
          form.append("logo", formData.logo);
        }
        form.append("categoryIds", JSON.stringify(formData.categoryIds));
      }
      if (editingItem) {
        form.append("_id", editingItem._id);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const res = editingItem
        ? await axios.put("/api/seller/manage", form, config)
        : await axios.post("/api/seller/manage", form, config);

      if (res.data.success) {
        toast.success(
          `${editingItem ? "Cập nhật" : "Thêm"} ${
            selectedType === "category" ? "loại" : "hãng"
          } thành công`
        );
        fetchData();
        resetForm();
        setEditingItem(null);
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message || "Lỗi khi lưu");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const isBrand = selectedType === "brand";
    setFormData({
      name: item.name,
      description: item.description,
      logo: null,
      categoryIds: isBrand ? item.categories?.map((c) => c._id) || [] : [],
    });
  };

  const handleDelete = async (item) => {
    if (!confirm("Xác nhận xóa?")) return;
    try {
      setActionLoading(true);
      const token = await getToken();
      const res = await axios.delete("/api/seller/manage", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: item._id, type: selectedType },
      });
      if (res.data.success) {
        toast.success("Xóa thành công");
        fetchData();
      } else {
        throw new Error(res.data.message);
      }
    } catch {
      toast.error("Lỗi khi xóa");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedBrand(expandedBrand === id ? null : id);
  };

  const list = selectedType === "category" ? categories : brands;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý Danh mục & Thương hiệu
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Quản lý các loại sản phẩm và thương hiệu trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "category", label: "Loại sản phẩm", icon: "📦" },
                { key: "brand", label: "Thương hiệu", icon: "🏷️" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setSelectedType(tab.key);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedType === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } transition-colors duration-200`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  <span
                    className={`ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                      selectedType === tab.key
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {tab.key === "category" ? categories.length : brands.length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {editingItem ? "Chỉnh sửa" : "Thêm mới"}{" "}
              {selectedType === "category" ? "loại sản phẩm" : "thương hiệu"}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên{" "}
                  {selectedType === "category"
                    ? "loại sản phẩm"
                    : "thương hiệu"}{" "}
                  *
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Nhập tên ${
                    selectedType === "category"
                      ? "loại sản phẩm"
                      : "thương hiệu"
                  }`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <input
                  type="text"
                  placeholder="Nhập mô tả"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={actionLoading}
                />
              </div>

              {selectedType === "brand" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo thương hiệu (≤ 2MB)
                    </label>

                    {(formData.logo || editingItem?.logo) && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <div className="relative inline-block">
                          <img
                            src={
                              formData.logo
                                ? URL.createObjectURL(formData.logo)
                                : editingItem?.logo
                            }
                            alt="Logo preview"
                            className="h-16 w-16 object-contain rounded-md border border-gray-200 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                formData.logo &&
                                typeof formData.logo === "object"
                              ) {
                                URL.revokeObjectURL(
                                  URL.createObjectURL(formData.logo)
                                );
                              }
                              setFormData({ ...formData, logo: null });
                            }}
                            disabled={actionLoading}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors disabled:opacity-50"
                            title="Xóa ảnh"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.logo ? "Logo mới" : "Logo hiện tại"}
                        </p>
                      </div>
                    )}

                    <div
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors cursor-pointer"
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() =>
                        document.getElementById("logo-upload").click()
                      }
                    >
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Tải ảnh lên</span>
                            <input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              disabled={actionLoading}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">hoặc kéo thả</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF tối đa 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thuộc loại sản phẩm
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                      {categories.map((cat) => (
                        <label key={cat._id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.categoryIds.includes(cat._id)}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...formData.categoryIds, cat._id]
                                : formData.categoryIds.filter(
                                    (id) => id !== cat._id
                                  );
                              setFormData({ ...formData, categoryIds: newIds });
                            }}
                            disabled={actionLoading}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {cat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              {editingItem && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    resetForm();
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
              )}
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </div>
                ) : editingItem ? (
                  "Cập nhật"
                ) : (
                  "Thêm mới"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* List Section */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Danh sách{" "}
                {selectedType === "category" ? "loại sản phẩm" : "thương hiệu"}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({list.length} mục)
                </span>
              </h3>
            </div>

            <div className="p-6">
              {list.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">
                    {selectedType === "category" ? "📦" : "🏷️"}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có{" "}
                    {selectedType === "category"
                      ? "loại sản phẩm"
                      : "thương hiệu"}{" "}
                    nào
                  </h3>
                  <p className="text-gray-500">
                    Hãy thêm{" "}
                    {selectedType === "category"
                      ? "loại sản phẩm"
                      : "thương hiệu"}{" "}
                    đầu tiên bằng form ở trên
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {list.map((item) => (
                    <div
                      key={item._id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 bg-white"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {selectedType === "brand" && item.logo && (
                            <div className="flex-shrink-0">
                              <img
                                src={item.logo}
                                alt={`${item.name} logo`}
                                className="h-12 w-12 object-contain rounded-lg border border-gray-200 bg-gray-50"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {item.name}
                            </h4>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={actionLoading}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors disabled:opacity-50"
                            title="Chỉnh sửa"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
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
                            onClick={() => handleDelete(item)}
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                            title="Xóa"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
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
                      </div>

                      {selectedType === "brand" && (
                        <div className="border-t border-gray-100 pt-4">
                          <button
                            onClick={() => toggleExpand(item._id)}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium w-full"
                          >
                            <span>Thuộc loại sản phẩm</span>
                            <svg
                              className={`ml-1 h-4 w-4 transform transition-transform ${
                                expandedBrand === item._id ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          {expandedBrand === item._id && (
                            <div className="mt-3 space-y-2">
                              {(item.categories || []).length === 0 ? (
                                <p className="text-sm text-gray-500 italic">
                                  Chưa thuộc loại sản phẩm nào
                                </p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {(item.categories || []).map((cat) => (
                                    <span
                                      key={cat._id}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {cat.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategoriesBrands;
