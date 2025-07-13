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
    <div className="mt-6 max-w-lg">
      <h2 className="text-lg font-medium mb-4">Chỉnh Sửa Sản Phẩm</h2>
      <form onSubmit={handleUpdateProduct} className="space-y-5">
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="edit-name">
            Tên Sản Phẩm
          </label>
          <input
            id="edit-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            value={formData.name || ""}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="edit-description">
            Chi Tiết Sản Phẩm
          </label>
          <textarea
            id="edit-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Nhập mô tả chi tiết sản phẩm"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            value={formData.description || ""}
            required
          />
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="edit-category">
              Loại
            </label>
            <select
              id="edit-category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) =>
                setFormData({ ...formData, categoryName: e.target.value })
              }
              value={formData.categoryName || ""}
              disabled={categories.length === 0}
            >
              {categories.length === 0 ? (
                <option value="">Không có loại nào</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="edit-brand">
              Hãng
            </label>
            <select
              id="edit-brand"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) =>
                setFormData({ ...formData, brandName: e.target.value })
              }
              value={formData.brandName || ""}
              disabled={brands.length === 0}
            >
              {brands.length === 0 ? (
                <option value="">Không có hãng nào</option>
              ) : (
                brands.map((br) => (
                  <option key={br._id} value={br.name}>
                    {br.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="edit-price">
              Giá Sản Phẩm
            </label>
            <input
              id="edit-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              value={formData.price !== undefined ? formData.price : ""}
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="edit-offer-price">
              Giá Ưu Đãi
            </label>
            <input
              id="edit-offer-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) =>
                setFormData({ ...formData, offerPrice: e.target.value })
              }
              value={
                formData.offerPrice !== undefined ? formData.offerPrice : ""
              }
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="edit-keywords">
            Từ Khóa
          </label>
          <input
            id="edit-keywords"
            type="text"
            placeholder="Nhập từ khóa mới (Enter để thêm)"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={handleAddKeyword}
          />
          <div className="mt-2 flex gap-2 flex-wrap">
            {keywordsArray.map((keyword, index) => (
              <span
                key={index}
                className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full flex items-center"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Nhấn Enter để thêm từ khóa, nhấp vào "×" để xóa.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="edit-images">
            Hình Ảnh (Tối đa 4)
          </label>
          <input
            id="edit-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
          />
          <div className="mt-2 flex gap-2 flex-wrap">
            {(formData.images || []).map((img, index) => (
              <div key={`existing-${index}`} className="relative">
                <img
                  src={img}
                  alt={`Existing ${index}`}
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {imagePreviews
              .slice(formData.images.length || 0)
              .map((img, index) => (
                <div key={`new-${index}`} className="relative">
                  <img
                    src={img}
                    alt={`Preview ${index}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveImage(index + (formData.images.length || 0))
                    }
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
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
  );
};

export default ProductEditForm;
