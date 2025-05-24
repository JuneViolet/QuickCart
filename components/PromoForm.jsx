import React, { useState } from "react";

const PromoForm = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    discount: initialData?.discount || "",
    expiresAt: initialData?.expiresAt || "",
    maxUses: initialData?.maxUses || "",
    isActive: initialData?.isActive || true,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Sửa Mã Khuyến Mãi" : "Thêm Mã Khuyến Mãi"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Mã</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              disabled={initialData}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">
              Giảm Giá (Phần trăm hoặc $)
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              step="0.01"
              className="w-full p-2 border rounded"
              placeholder="0.1 (10%) hoặc 20 ($20)"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Ngày Hết Hạn</label>
            <input
              type="date"
              name="expiresAt"
              value={
                formData.expiresAt
                  ? new Date(formData.expiresAt).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Số Lần Sử Dụng Tối Đa</label>
            <input
              type="number"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Không giới hạn nếu để trống"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Trạng Thái</label>
            <select
              name="isActive"
              value={formData.isActive}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value={true}>Hoạt động</option>
              <option value={false}>Tắt</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoForm;
