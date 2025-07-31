"use client";
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { tail } from "lodash";

const AddVariantPopup = ({
  isAddingVariant,
  products,
  attributes,
  newVariantData,
  setNewVariantData,
  handleAddVariant,
  setIsAddingVariant,
  formatCurrency,
}) => {
  const { getToken } = useAppContext();
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ tránh double submit
  const [erroPrice, setErroprice] = useState("");
  const product = products.find((p) => p._id === isAddingVariant);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4); // Lấy tối đa 4 ảnh
    if (files.length > 0) {
      setImageFiles(files); // Reset và chỉ giữ ảnh mới
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleRemoveImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErroprice("");

    if (isSubmitting) return;

    setIsSubmitting(true);

    if (Number(newVariantData.offerPrice) <= 0) {
      setErroprice("Giá tiền không hợp lệ");
      toast.error("Giá tiền không hợp lệ");
      setIsSubmitting(false);
      return;
    }

    // Kiểm tra sku trước khi gửi
    if (newVariantData.sku) {
      try {
        const token = await getToken();
        const { data: existingVariants } = await axios.get(
          "/api/variants/manage",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (existingVariants.success) {
          const isSkuDuplicate = existingVariants.variants.some(
            (v) => v.sku === newVariantData.sku
          );
          if (isSkuDuplicate) {
            toast.error("SKU đã tồn tại! Vui lòng chọn SKU khác.");
            setIsSubmitting(false);
            return;
          }
        }
      } catch (error) {
        console.error("Check SKU Error:", error);
        toast.error("Không thể kiểm tra SKU. Vui lòng thử lại.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const token = await getToken();
      const res = await axios.get("/api/variants/manage", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const variants = res.data.variants;

        const isSameAttributes = (a, b) => {
          if (a.length !== b.length) return false;

          const normalize = (arr) =>
            arr
              .map((item) => `${item.attributeId}:${item.value}`)
              .sort()
              .join("|");

          return normalize(a) === normalize(b);
        };

        const isSkuDuplicateName = variants.some((variant) => {
          if (variant.productId !== isAddingVariant) return false;

          const existingAttrs = variant.attributeRefs || [];
          const newAttrs = newVariantData.attributeRefs || [];

          return isSameAttributes(existingAttrs, newAttrs);
        });

        if (isSkuDuplicateName) {
          toast.error("Tên biến thể đã tồn tại (trùng thuộc tính)!");
          setIsSubmitting(false);
          return;
        }
      }
    } catch (error) {
      console.error("Kiểm tra trùng tên biến thể: ", error);
      toast.error("Lỗi kiểm tra biến thể, vui lòng thử lại.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("price", newVariantData.price || 0);
    formData.append("offerPrice", newVariantData.offerPrice || 0);
    formData.append("stock", newVariantData.stock || 0);
    formData.append("sku", newVariantData.sku || "");
    formData.append(
      "attributeRefs",
      JSON.stringify(newVariantData.attributeRefs || [])
    );
    formData.append("productId", isAddingVariant);
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const token = await getToken();
      const response = await axios.post("/api/variants/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Đảm bảo header
        },
      });

      if (response.data.success) {
        toast.success("Thêm biến thể thành công!");
        handleAddVariant(); // Gọi callback từ ProductList
        setNewVariantData({
          price: "",
          offerPrice: "",
          stock: "",
          sku: "",
          attributeRefs: [],
        });
        setImageFiles([]);
        setImagePreviews([]);
        setIsAddingVariant(null);
      } else {
        toast.error(response.data.message || "Thất bại khi thêm biến thể");
      }
    } catch (error) {
      console.error("Add Variant Error:", error);
      toast.error(
        "Lỗi: " +
          (error.response?.data?.message ||
            "Không thể thêm biến thể. Vui lòng thử lại.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">
          Thêm Biến Thể cho {product?.name || "Sản phẩm"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-base font-medium">Thuộc Tính</label>
            {attributes.map((attr) => (
              <div key={attr._id} className="mb-2">
                <select
                  className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 w-full"
                  onChange={(e) =>
                    setNewVariantData((prev) => ({
                      ...prev,
                      attributeRefs: [
                        ...prev.attributeRefs.filter(
                          (ref) => ref.attributeId !== attr._id
                        ),
                        { attributeId: attr._id, value: e.target.value },
                      ],
                    }))
                  }
                  value={
                    newVariantData.attributeRefs.find(
                      (ref) => ref.attributeId === attr._id
                    )?.value || ""
                  }
                >
                  <option value="">Chọn {attr.name}</option>
                  {attr.values.map((value) => (
                    <option
                      key={typeof value === "object" ? value.text : value}
                      value={typeof value === "object" ? value.text : value}
                    >
                      {typeof value === "object" ? value.text : value}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium">Giá Gốc</label>
              <input
                type="number"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                value={newVariantData.price || ""}
                onChange={(e) =>
                  setNewVariantData({
                    ...newVariantData,
                    price: e.target.value,
                  })
                }
                placeholder={
                  product?.price ? formatCurrency(product.price) : "0"
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-base font-medium">Giá KM</label>
              <input
                type="number"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                value={newVariantData.offerPrice || ""}
                onChange={(e) =>
                  setNewVariantData({
                    ...newVariantData,
                    offerPrice: e.target.value,
                  })
                }
                placeholder={
                  product?.offerPrice ? formatCurrency(product.offerPrice) : "0"
                }
              />
              {erroPrice && <p className="text-sm text-red-500">{erroPrice}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-base font-medium">Số Lượng</label>
              <input
                type="number"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                value={newVariantData.stock}
                onChange={(e) =>
                  setNewVariantData({
                    ...newVariantData,
                    stock: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-base font-medium">SKU</label>
              <input
                type="text"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                value={newVariantData.sku}
                onChange={(e) =>
                  setNewVariantData({
                    ...newVariantData,
                    sku: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-4">
            <label className="text-base font-medium">Hình ảnh (tối đa 4)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="outline-none py-2 px-3 border rounded border-gray-500/40"
              onChange={handleImageChange}
            />
            <div className="mt-2 flex gap-2 flex-wrap">
              {imagePreviews.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt={`Preview ${index}`}
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
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded ${
                isSubmitting ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              {isSubmitting ? "Đang thêm..." : "Thêm"}
            </button>
            <button
              type="button"
              onClick={() => setIsAddingVariant(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVariantPopup;
