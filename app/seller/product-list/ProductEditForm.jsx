import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ProductEditForm = ({
  editingProduct,
  formData,
  setFormData,
  categories,
  brands,
  handleUpdateProduct,
  handleCancelEdit,
  imageFiles,
  imagePreviews,
  handleImageChange,
  handleRemoveImage,
}) => {
  const [newKeyword, setNewKeyword] = useState(""); // State để nhập keyword mới

  // Chuyển formData.keywords thành mảng, đảm bảo là mảng
  const keywordsArray = Array.isArray(formData.keywords)
    ? formData.keywords
    : formData.keywords
    ? formData.keywords.split(/[, ]+/).filter((k) => k.trim())
    : [];

  // Thêm keyword mới
  const handleAddKeyword = (e) => {
    if (e.key === "Enter" && newKeyword.trim()) {
      e.preventDefault();
      const updatedKeywords = [...keywordsArray, newKeyword.trim()];
      setFormData({ ...formData, keywords: updatedKeywords });
      setNewKeyword(""); // Reset input
    }
  };

  // Xóa keyword
  const handleRemoveKeyword = (keywordToRemove) => {
    const updatedKeywords = keywordsArray.filter((k) => k !== keywordToRemove);
    setFormData({ ...formData, keywords: updatedKeywords });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
          Chỉnh Sửa Sản Phẩm
        </h2>
        <form onSubmit={handleUpdateProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="edit-name"
              >
                Tên Sản Phẩm <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-name"
                type="text"
                placeholder="Nhập tên sản phẩm"
                className="outline-none py-3 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                value={formData.name || ""}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="edit-category"
              >
                Loại <span className="text-red-500">*</span>
              </label>
              <select
                id="edit-category"
                className="outline-none py-3 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, categoryName: e.target.value })
                }
                value={formData.categoryName || ""}
                disabled={categories.length === 0}
                required
              >
                <option value="">Chọn loại sản phẩm</option>
                {categories.length === 0 ? (
                  <option value="" disabled>
                    Không có loại nào
                  </option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-semibold text-gray-700"
              htmlFor="edit-description"
            >
              Chi Tiết Sản Phẩm <span className="text-red-500">*</span>
            </label>
            <textarea
              id="edit-description"
              rows={4}
              className="outline-none py-3 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
              placeholder="Nhập mô tả chi tiết sản phẩm"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              value={formData.description || ""}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="edit-brand"
              >
                Hãng <span className="text-red-500">*</span>
              </label>
              <select
                id="edit-brand"
                className="outline-none py-3 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, brandName: e.target.value })
                }
                value={formData.brandName || ""}
                disabled={brands.length === 0}
                required
              >
                <option value="">Chọn hãng</option>
                {brands.length === 0 ? (
                  <option value="" disabled>
                    Không có hãng nào
                  </option>
                ) : (
                  brands.map((br) => (
                    <option key={br._id} value={br.name}>
                      {br.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            {/* <div className="flex flex-col gap-1">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="edit-price"
              >
                Giá Sản Phẩm <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-price"
                type="number"
                placeholder="0"
                min="0"
                step="1000"
                className="outline-none py-3 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                value={formData.price !== undefined ? formData.price : ""}
                required
              />
            </div> */}
            {/* <div className="flex flex-col gap-1">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="edit-offer-price"
              >
                Giá Ưu Đãi <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-offer-price"
                type="number"
                placeholder="0"
                min="0"
                step="1000"
                className="outline-none py-3 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, offerPrice: e.target.value })
                }
                value={
                  formData.offerPrice !== undefined ? formData.offerPrice : ""
                }
                required
              />
            </div> */}
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-semibold text-gray-700"
              htmlFor="edit-keywords"
            >
              Từ Khóa
            </label>
            <input
              id="edit-keywords"
              type="text"
              placeholder="Nhập từ khóa mới (Enter để thêm)"
              className="outline-none py-3 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={handleAddKeyword}
            />
            <div className="mt-2 flex gap-2 flex-wrap">
              {keywordsArray.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center text-sm font-medium"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-2 text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Nhấn Enter để thêm từ khóa, nhấp vào "×" để xóa.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-semibold text-gray-700"
              htmlFor="edit-images"
            >
              Hình Ảnh (Tối đa 4)
            </label>
            <input
              id="edit-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="outline-none py-3 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="mt-3 flex gap-3 flex-wrap">
              {(formData.images || []).map((img, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <img
                    src={img}
                    alt={`Existing ${index}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
              {imagePreviews
                .slice(formData.images.length || 0)
                .map((img, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={img}
                      alt={`Preview ${index}`}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveImage(index + (formData.images.length || 0))
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              CẬP NHẬT
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              HỦY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditForm;
