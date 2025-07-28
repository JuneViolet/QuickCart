"use client";

import React from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

const ProductInfo = ({
  productData,
  selectedColor,
  setSelectedColor,
  selectedStorage,
  setSelectedStorage,
  selectedVariant,
  attributes,
  formatCurrency,
  handleAddToCart,
  handleBuyNow,
}) => {
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

  const renderStars = (ratingValue) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Image
            key={index}
            className="h-4 w-4"
            src={
              index < Math.floor(ratingValue)
                ? assets.star_icon
                : assets.star_dull_icon
            }
            alt="star_icon"
          />
        ))}
      </div>
    );
  };

  const averageRating = productData?.averageRating || 0;

  return (
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
            {formatCurrency(selectedVariant?.price || productData.price || 0)}
          </span>
        )}
      </p>
      <hr className="bg-gray-600 my-6" />

      {/* Color Selection */}
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

      {/* Storage Selection */}
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

      {/* Product Details Table */}
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

      {/* Action Buttons */}
      <div className="flex items-center mt-10 gap-4">
        <button
          onClick={handleAddToCart}
          className={`w-full py-3.5 text-gray-800/80 transition ${
            selectedVariant?.stock > 0
              ? "bg-gray-100 hover:bg-gray-200"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!selectedVariant || selectedVariant.stock <= 0}
          title={
            selectedVariant?.stock <= 0
              ? "Sản phẩm đã hết hàng"
              : "Thêm vào giỏ hàng"
          }
        >
          {selectedVariant?.stock <= 0 ? "Hết hàng" : "Thêm Vào Giỏ Hàng"}
        </button>
        <button
          onClick={handleBuyNow}
          className={`w-full py-3.5 text-white transition ${
            selectedVariant?.stock > 0
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-orange-300 cursor-not-allowed"
          }`}
          disabled={!selectedVariant || selectedVariant.stock <= 0}
          title={
            selectedVariant?.stock <= 0 ? "Sản phẩm đã hết hàng" : "Mua ngay"
          }
        >
          {selectedVariant?.stock <= 0 ? "Hết hàng" : "Mua Ngay"}
        </button>
      </div>

      {/* Thông báo hết hàng */}
      {selectedVariant?.stock <= 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">
            ⚠️ Sản phẩm này hiện đã hết hàng. Vui lòng chọn sản phẩm khác hoặc
            liên hệ với chúng tôi để được thông báo khi có hàng trở lại.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
