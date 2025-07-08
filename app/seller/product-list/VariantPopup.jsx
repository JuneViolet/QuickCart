"use client";
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const VariantPopup = ({
  selectedProductId,
  products,
  variants,
  attributes,
  editVariantData,
  setEditVariantData,
  editingVariant,
  setEditingVariant,
  setSelectedProductId,
  handleEditVariant,
  handleUpdateVariant,
  handleDeleteVariant,
  formatCurrency,
  fetchProductData,
}) => {
  const { getToken } = useAppContext();
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const product = products?.find((p) => p._id === selectedProductId);

  // Load initial images when editing a variant
  useEffect(() => {
    if (editingVariant && variants?.[selectedProductId]) {
      const variant = variants[selectedProductId].find(
        (v) => v._id === editingVariant
      );
      if (variant) {
        setEditVariantData({
          price: variant.price || "",
          offerPrice: variant.offerPrice || "",
          stock: variant.stock || "",
          sku: variant.sku || "",
          attributeRefs: variant.attributeRefs || [],
          images: variant.images || [],
        });
        setImagePreviews(
          variant.images.map((img) => (typeof img === "string" ? img : "")) ||
            []
        );
        setImageFiles([]);
      }
    }
  }, [editingVariant, selectedProductId, variants]);

  // Handle new image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - imageFiles.length);
    if (files.length > 0) {
      const newFiles = [...imageFiles, ...files];
      const newPreviews = [...imagePreviews];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (
            newPreviews.length ===
            newFiles.length + (editVariantData?.images?.length || 0)
          ) {
            setImageFiles(newFiles);
            setImagePreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    if (index < (editVariantData?.images?.length || 0)) {
      // Remove existing image
      const newImages = editVariantData.images.filter((_, i) => i !== index);
      setEditVariantData({ ...editVariantData, images: newImages });
      setImagePreviews(
        newImages.map((img) => (typeof img === "string" ? img : ""))
      );
    } else {
      // Remove new uploaded image
      const newIndex = index - (editVariantData?.images?.length || 0);
      const newFiles = imageFiles.filter((_, i) => i !== newIndex);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImageFiles(newFiles);
      setImagePreviews(newPreviews);
    }
  };

  // Handle custom update variant
  const handleCustomUpdateVariant = async (e, variantId) => {
    e.preventDefault();
    if (!variantId) {
      toast.error("Vui lòng chọn một biến thể để cập nhật.");
      return;
    }

    const formData = new FormData();
    formData.append("price", editVariantData?.price || 0);
    formData.append("offerPrice", editVariantData?.offerPrice || 0);
    formData.append("stock", editVariantData?.stock || 0);
    formData.append("sku", editVariantData?.sku || "");
    formData.append(
      "attributeRefs",
      JSON.stringify(editVariantData?.attributeRefs || [])
    );
    (editVariantData?.images || []).forEach((img) => {
      if (typeof img === "string") formData.append("existingImages", img);
    });
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.put(
        `/api/variants/manage/${variantId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Đảm bảo header đúng
          },
        }
      );
      if (response.data.success) {
        await handleUpdateVariant(e, variantId); // Cập nhật UI
        if (fetchProductData) await fetchProductData(); // Làm mới dữ liệu
        setImageFiles([]);
        setImagePreviews([]);
        setEditVariantData({
          price: "",
          offerPrice: "",
          stock: "",
          sku: "",
          attributeRefs: [],
          images: [],
        });
        setEditingVariant(null);
        toast.success("Cập nhật biến thể thành công!");
      } else {
        toast.error(response.data.message || "Thất bại!");
      }
    } catch (error) {
      console.error(
        "Update Variant Error:",
        error.response?.data || error.message
      );
      toast.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-lg font-medium mb-4">
          Biến Thể của {product?.name || "Sản phẩm"}
        </h3>
        {selectedProductId && (
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {variants?.[selectedProductId] &&
            variants[selectedProductId].length > 0 ? (
              variants[selectedProductId].map((variant) => (
                <div key={variant._id} className="border-b py-2">
                  {editingVariant === variant._id ? (
                    <form
                      onSubmit={(e) =>
                        handleCustomUpdateVariant(e, variant._id)
                      }
                      className="space-y-3"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-base font-medium">
                          Thuộc Tính
                        </label>
                        {(attributes || []).map((attr) => (
                          <div key={attr._id} className="mb-2">
                            <select
                              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 w-full"
                              onChange={(e) =>
                                setEditVariantData((prev) => {
                                  const newRefs = (
                                    prev?.attributeRefs || []
                                  ).map((ref) =>
                                    ref.attributeId === attr._id
                                      ? { ...ref, value: e.target.value }
                                      : ref
                                  );
                                  return { ...prev, attributeRefs: newRefs };
                                })
                              }
                              value={
                                (editVariantData?.attributeRefs || []).find(
                                  (ref) => ref.attributeId === attr._id
                                )?.value || ""
                              }
                            >
                              <option value="">Chọn {attr.name}</option>
                              {(attr.values || []).map((value) => (
                                <option
                                  key={
                                    typeof value === "object"
                                      ? value.text
                                      : value
                                  }
                                  value={
                                    typeof value === "object"
                                      ? value.text
                                      : value
                                  }
                                >
                                  {typeof value === "object"
                                    ? value.text
                                    : value}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-5 flex-wrap">
                        <div className="flex flex-col gap-1 w-32">
                          <label className="text-base font-medium">
                            Giá Gốc
                          </label>
                          <input
                            type="number"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            value={editVariantData?.price || ""}
                            onChange={(e) =>
                              setEditVariantData({
                                ...editVariantData,
                                price: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-1 w-32">
                          <label className="text-base font-medium">
                            Giá Khuyến Mãi
                          </label>
                          <input
                            type="number"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            value={editVariantData?.offerPrice || ""}
                            onChange={(e) =>
                              setEditVariantData({
                                ...editVariantData,
                                offerPrice: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-1 w-32">
                          <label className="text-base font-medium">
                            Số Lượng
                          </label>
                          <input
                            type="number"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            value={editVariantData?.stock || ""}
                            onChange={(e) =>
                              setEditVariantData({
                                ...editVariantData,
                                stock: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-1 w-32">
                          <label className="text-base font-medium">SKU</label>
                          <input
                            type="text"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            value={editVariantData?.sku || ""}
                            onChange={(e) =>
                              setEditVariantData({
                                ...editVariantData,
                                sku: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                          <label className="text-base font-medium">
                            Hình Ảnh (Tối đa 4)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            onChange={handleImageChange}
                          />
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {(editVariantData?.images || []).map(
                              (img, index) => (
                                <div
                                  key={`existing-${index}`}
                                  className="relative"
                                >
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
                              )
                            )}
                            {imagePreviews
                              .slice(editVariantData?.images?.length || 0)
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
                                      handleRemoveImage(
                                        index +
                                          (editVariantData?.images?.length || 0)
                                      )
                                    }
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded"
                          disabled={loading}
                        >
                          {loading ? "Đang cập nhật..." : "Cập nhật"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingVariant(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p>
                        {product?.name || "Sản phẩm"} -{" "}
                        {(variant.attributeRefs || [])
                          .map((ref) =>
                            typeof ref.value === "object"
                              ? ref.value.text
                              : ref.value
                          )
                          .join(" - ") || "Không có thuộc tính"}
                      </p>
                      <p>SKU: {variant.sku || "N/A"}</p>
                      <p>Giá: {formatCurrency(variant.price)}</p>
                      {variant.offerPrice &&
                        variant.offerPrice < variant.price && (
                          <p className="text-red-500">
                            Khuyến mãi: {formatCurrency(variant.offerPrice)}
                          </p>
                        )}
                      <p>Số lượng: {variant.stock || 0}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditVariant(variant)}
                          className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteVariant(variant._id)}
                          className="px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p>Không có biến thể nào.</p>
            )}
          </div>
        )}
        <button
          onClick={() => {
            setSelectedProductId(null);
            setEditingVariant(null);
            setImageFiles([]);
            setImagePreviews([]);
            setEditVariantData({
              price: "",
              offerPrice: "",
              stock: "",
              sku: "",
              attributeRefs: [],
              images: [],
            });
          }}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default VariantPopup;
