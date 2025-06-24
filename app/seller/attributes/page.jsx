"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import Loading from "@/components/Loading";

const Attributes = () => {
  const { getToken, isLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attributes, setAttributes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAttribute, setNewAttribute] = useState({
    name: "",
    value: "", // Chỉ nhập một giá trị mới tại một thời điểm
  });
  const [editAttribute, setEditAttribute] = useState(null);

  const fetchAttributes = async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Không lấy được token. Hãy đăng nhập lại.");
        return;
      }
      const { data } = await axios.get("/api/attributes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setAttributes(data.attributes || []);
      } else {
        toast.error(data.message || "Không thể tải thuộc tính");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thuộc tính:", error);
      toast.error("Lỗi server. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = async (e) => {
    e.preventDefault();
    if (!["Màu sắc", "Dung lượng"].includes(newAttribute.name)) {
      toast.error("Chỉ có thể thêm thuộc tính 'Màu sắc' hoặc 'Dung lượng'");
      return;
    }
    if (!newAttribute.value.trim()) {
      toast.error("Vui lòng nhập giá trị");
      return;
    }

    try {
      const token = await getToken();
      const existingAttribute = attributes.find(
        (attr) => attr.name === newAttribute.name
      );
      if (existingAttribute) {
        const updatedValues = [
          ...existingAttribute.values,
          newAttribute.value.trim(),
        ];
        const { data } = await axios.put(
          `/api/attributes/${existingAttribute._id}`, // Sử dụng dynamic route
          { name: existingAttribute.name, values: updatedValues },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          toast.success(data.message);
          setIsAdding(false);
          setNewAttribute({ name: "", value: "" });
          fetchAttributes();
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(
          "/api/attributes",
          { name: newAttribute.name, values: [newAttribute.value.trim()] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          toast.success(data.message);
          setIsAdding(false);
          setNewAttribute({ name: "", value: "" });
          fetchAttributes();
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Add/Update Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleEditAttribute = (attr) => {
    setEditAttribute({ ...attr });
  };

  const handleUpdateAttribute = async (e) => {
    e.preventDefault();
    if (!["Màu sắc", "Dung lượng"].includes(editAttribute.name)) {
      toast.error("Chỉ có thể cập nhật thuộc tính 'Màu sắc' hoặc 'Dung lượng'");
      return;
    }
    if (!editAttribute.value.trim()) {
      toast.error("Vui lòng nhập giá trị");
      return;
    }

    try {
      const token = await getToken();
      const existingAttribute = attributes.find(
        (attr) =>
          attr.name === editAttribute.name && attr._id !== editAttribute._id
      );
      if (existingAttribute) {
        // Thêm giá trị mới vào thuộc tính hiện có
        const updatedValues = [
          ...existingAttribute.values,
          editAttribute.value.trim(),
        ];
        const { data } = await axios.put(
          `/api/attributes/${existingAttribute._id}`,
          { name: existingAttribute.name, values: updatedValues },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          toast.success(data.message);
          setEditAttribute(null);
          fetchAttributes();
        } else {
          toast.error(data.message);
        }
      } else {
        // Cập nhật thuộc tính hiện tại
        const updatedValues = [
          ...editAttribute.values,
          editAttribute.value.trim(),
        ];
        const { data } = await axios.put(
          `/api/attributes/${editAttribute._id}`,
          { name: editAttribute.name, values: updatedValues },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          toast.success(data.message);
          setEditAttribute(null);
          fetchAttributes();
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteAttribute = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa thuộc tính này?")) {
      try {
        const token = await getToken();
        console.log("Deleting ID:", id);
        const { data } = await axios.delete(`/api/attributes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          toast.success(data.message);
          fetchAttributes();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Delete Error:", error.response?.data || error.message);
        toast.error(
          error.response?.data?.message ||
            "Lỗi khi xóa thuộc tính: " + error.message
        );
      }
    }
  };

  useEffect(() => {
    if (isLoaded) fetchAttributes();
  }, [isLoaded]);

  return (
    <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
      {loading ? (
        <Loading />
      ) : (
        <div className="md:p-10 p-4 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Quản Lý Thuộc Tính Biến Thể</h2>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Thêm Thuộc Tính Mới
            </button>
          </div>

          {isAdding && (
            <div className="mt-6 max-w-lg">
              <h2 className="text-lg font-medium mb-4">Thêm Thuộc Tính</h2>
              <form onSubmit={handleAddAttribute} className="space-y-5">
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="new-name">
                    Tên Thuộc Tính
                  </label>
                  <select
                    id="new-name"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    value={newAttribute.name}
                    onChange={(e) =>
                      setNewAttribute({ ...newAttribute, name: e.target.value })
                    }
                    required
                  >
                    <option value="">Chọn loại thuộc tính</option>
                    <option value="Màu sắc">Màu sắc</option>
                    <option value="Dung lượng">Dung lượng</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="new-value">
                    Giá Trị Mới
                  </label>
                  <input
                    id="new-value"
                    type="text"
                    placeholder="Nhập giá trị mới (ví dụ: Đỏ)"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    value={newAttribute.value}
                    onChange={(e) =>
                      setNewAttribute({
                        ...newAttribute,
                        value: e.target.value,
                      })
                    }
                    required
                  />
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
                    onClick={() => setIsAdding(false)}
                    className="px-8 py-2.5 bg-gray-500 text-white font-medium rounded"
                  >
                    HỦY
                  </button>
                </div>
              </form>
            </div>
          )}

          {editAttribute && (
            <div className="mt-6 max-w-lg">
              <h2 className="text-lg font-medium mb-4">Chỉnh Sửa Thuộc Tính</h2>
              <form onSubmit={handleUpdateAttribute} className="space-y-5">
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="edit-name">
                    Tên Thuộc Tính
                  </label>
                  <select
                    id="edit-name"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    value={editAttribute.name}
                    onChange={(e) =>
                      setEditAttribute({
                        ...editAttribute,
                        name: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Chọn loại thuộc tính</option>
                    <option value="Màu sắc">Màu sắc</option>
                    <option value="Dung lượng">Dung lượng</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="edit-value">
                    Giá Trị Mới
                  </label>
                  <input
                    id="edit-value"
                    type="text"
                    placeholder="Nhập giá trị mới"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    value={editAttribute.value}
                    onChange={(e) =>
                      setEditAttribute({
                        ...editAttribute,
                        value: e.target.value,
                      })
                    }
                    required
                  />
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
                    onClick={() => setEditAttribute(null)}
                    className="px-8 py-2.5 bg-gray-500 text-white font-medium rounded"
                  >
                    HỦY
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="max-w-4xl rounded-md">
            {attributes.length === 0 ? (
              <p className="text-gray-500">Không tìm thấy thuộc tính nào</p>
            ) : (
              attributes.map((attr) => (
                <div
                  key={attr._id}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300"
                >
                  <div className="flex-1">
                    <span className="font-medium">{attr.name}</span>
                    <p>{attr.values.join(", ")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAttribute(attr)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteAttribute(attr._id)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Attributes;
