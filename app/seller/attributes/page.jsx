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
    value: "",
    colorCode: "#000000",
  });

  const [editingAttrId, setEditingAttrId] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingColor, setEditingColor] = useState("#000000");

  const fetchAttributes = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/attributes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setAttributes(data.attributes || []);
      else toast.error(data.message || "Không thể tải thuộc tính");
    } catch (error) {
      toast.error("Lỗi server. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = async (e) => {
    e.preventDefault();
    const { name, value, colorCode } = newAttribute;
    if (!["Màu sắc", "Dung lượng"].includes(name)) {
      return toast.error("Chỉ thêm 'Màu sắc' hoặc 'Dung lượng'");
    }
    if (!value.trim()) return toast.error("Vui lòng nhập giá trị");

    try {
      const token = await getToken();
      const existing = attributes.find((attr) => attr.name === name);
      const newVal =
        name === "Màu sắc"
          ? { text: value.trim(), color: colorCode }
          : value.trim();

      if (existing) {
        const updatedValues = [...existing.values, newVal];
        await axios.put(
          `/api/attributes/${existing._id}`,
          { name, values: updatedValues },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          "/api/attributes",
          { name, values: [newVal] },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      toast.success("Thêm thuộc tính thành công");
      setNewAttribute({ name: "", value: "", colorCode: "#000000" });
      setIsAdding(false);
      fetchAttributes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi thêm thuộc tính");
    }
  };

  const handleDeleteAttribute = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thuộc tính này?")) return;
    try {
      const token = await getToken();
      await axios.delete(`/api/attributes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Đã xóa thuộc tính");
      fetchAttributes();
    } catch (error) {
      toast.error("Lỗi khi xóa thuộc tính");
    }
  };

  const handleDeleteValue = async (attrId, indexToDelete) => {
    if (!confirm("Bạn có chắc chắn muốn xóa giá trị này?")) return;
    try {
      const token = await getToken();
      const attr = attributes.find((a) => a._id === attrId);
      if (!attr) return;

      const updatedValues = attr.values.filter((_, i) => i !== indexToDelete);

      await axios.put(
        `/api/attributes/${attrId}`,
        { name: attr.name, values: updatedValues },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Đã xóa giá trị");
      fetchAttributes();
    } catch (error) {
      toast.error("Lỗi khi xóa giá trị");
    }
  };

  const handleUpdateValue = async (e, attrId, index, name) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const attr = attributes.find((a) => a._id === attrId);
      const updatedValues = [...attr.values];

      if (name === "Màu sắc") {
        updatedValues[index] = { text: editingValue, color: editingColor };
      } else {
        updatedValues[index] = editingValue;
      }

      await axios.put(
        `/api/attributes/${attrId}`,
        { name, values: updatedValues },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Cập nhật thành công");
      setEditingAttrId(null);
      setEditIndex(null);
      fetchAttributes();
    } catch (error) {
      toast.error("Lỗi khi cập nhật");
    }
  };

  useEffect(() => {
    if (isLoaded) fetchAttributes();
  }, [isLoaded]);

  return (
    <div className="flex-1 h-screen overflow-auto flex flex-col p-6 md:p-8 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Quản Lý Thuộc Tính Biến Thể
              </h2>
              <p className="text-gray-600 text-sm">
                Quản lý màu sắc và dung lượng cho sản phẩm của bạn
              </p>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                isAdding
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              }`}
            >
              {isAdding ? "✕ Đóng" : "+ Thêm Thuộc Tính"}
            </button>
          </div>

          {/* Add Form */}
          {isAdding && (
            <div className="mb-8">
              <form
                onSubmit={handleAddAttribute}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-2xl mx-auto"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></span>
                  Thêm Thuộc Tính Mới
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên Thuộc Tính
                    </label>
                    <select
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      value={newAttribute.name}
                      onChange={(e) =>
                        setNewAttribute({
                          ...newAttribute,
                          name: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">-- Chọn loại thuộc tính --</option>
                      <option value="Màu sắc">🎨 Màu sắc</option>
                      <option value="Dung lượng">💾 Dung lượng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giá Trị
                    </label>
                    <input
                      type="text"
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      value={newAttribute.value}
                      onChange={(e) =>
                        setNewAttribute({
                          ...newAttribute,
                          value: e.target.value,
                        })
                      }
                      placeholder="Ví dụ: Đỏ, Xanh, 128GB..."
                      required
                    />
                  </div>
                </div>

                {newAttribute.name === "Màu sắc" && (
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mã Màu
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        className="w-16 h-12 border-2 border-gray-200 rounded-lg cursor-pointer"
                        value={newAttribute.colorCode}
                        onChange={(e) =>
                          setNewAttribute({
                            ...newAttribute,
                            colorCode: e.target.value,
                          })
                        }
                      />
                      <span className="text-sm text-gray-600">
                        {newAttribute.colorCode}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    ✓ Thêm Thuộc Tính
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Attributes List */}
          <div className="space-y-6 max-w-6xl mx-auto w-full">
            {attributes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl text-gray-400">📋</span>
                </div>
                <p className="text-gray-500 text-lg">
                  Chưa có thuộc tính nào được tạo
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Hãy thêm thuộc tính đầu tiên để bắt đầu
                </p>
              </div>
            ) : (
              attributes.map((attr) => (
                <div
                  key={attr._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <span className="w-3 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4"></span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            {attr.name === "Màu sắc" ? "🎨" : "💾"}
                            {attr.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {attr.values.length} giá trị
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAttribute(attr._id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all duration-200 hover:text-red-700"
                      >
                        🗑️ Xóa
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {attr.values.map((v, i) => {
                        const isEditing =
                          editingAttrId === attr._id && editIndex === i;

                        if (attr.name === "Màu sắc") {
                          return (
                            <div
                              key={i}
                              className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all duration-200"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <span
                                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                                  style={{ backgroundColor: v.color }}
                                ></span>
                                <span className="font-medium text-gray-700">
                                  {v.text}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingAttrId(attr._id);
                                    setEditIndex(i);
                                    setEditingValue(v.text);
                                    setEditingColor(v.color);
                                  }}
                                  className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200"
                                >
                                  ✏️ Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteValue(attr._id, i)}
                                  className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200"
                                >
                                  ✕ Xóa
                                </button>
                              </div>

                              {isEditing && (
                                <form
                                  onSubmit={(e) =>
                                    handleUpdateValue(e, attr._id, i, attr.name)
                                  }
                                  className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200"
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    <input
                                      value={editingValue}
                                      onChange={(e) =>
                                        setEditingValue(e.target.value)
                                      }
                                      className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                                      placeholder="Tên màu"
                                    />
                                    <input
                                      type="color"
                                      value={editingColor}
                                      onChange={(e) =>
                                        setEditingColor(e.target.value)
                                      }
                                      className="w-12 h-10 border-2 border-gray-200 rounded-lg cursor-pointer"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="submit"
                                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                                    >
                                      💾 Lưu
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingAttrId(null);
                                        setEditIndex(null);
                                      }}
                                      className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 transition-colors"
                                    >
                                      Hủy
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={i}
                              className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all duration-200"
                            >
                              {isEditing ? (
                                <form
                                  onSubmit={(e) =>
                                    handleUpdateValue(e, attr._id, i, attr.name)
                                  }
                                  className="space-y-3"
                                >
                                  <input
                                    value={editingValue}
                                    onChange={(e) =>
                                      setEditingValue(e.target.value)
                                    }
                                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      type="submit"
                                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                                    >
                                      💾 Lưu
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingAttrId(null);
                                        setEditIndex(null);
                                      }}
                                      className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 transition-colors"
                                    >
                                      Hủy
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <>
                                  <div className="font-medium text-gray-700 mb-2">
                                    {v}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingAttrId(attr._id);
                                        setEditIndex(i);
                                        setEditingValue(v);
                                      }}
                                      className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200"
                                    >
                                      ✏️ Sửa
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteValue(attr._id, i)
                                      }
                                      className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200"
                                    >
                                      ✕ Xóa
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Attributes;
