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
    <div className="flex-1 h-screen overflow-auto flex flex-col p-6 md:p-10 bg-gray-50">
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Quản Lý Thuộc Tính Biến Thể
            </h2>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {isAdding ? "Đóng" : "Thêm Thuộc Tính"}
            </button>
          </div>

          {isAdding && (
            <form
              onSubmit={handleAddAttribute}
              className="bg-white rounded-lg shadow p-6 space-y-4 max-w-xl"
            >
              <div>
                <label className="font-medium">Tên Thuộc Tính</label>
                <select
                  className="w-full mt-1 border rounded px-3 py-2"
                  value={newAttribute.name}
                  onChange={(e) =>
                    setNewAttribute({ ...newAttribute, name: e.target.value })
                  }
                  required
                >
                  <option value="">-- Chọn loại --</option>
                  <option value="Màu sắc">Màu sắc</option>
                  <option value="Dung lượng">Dung lượng</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Giá Trị</label>
                <input
                  type="text"
                  className="w-full mt-1 border rounded px-3 py-2"
                  value={newAttribute.value}
                  onChange={(e) =>
                    setNewAttribute({ ...newAttribute, value: e.target.value })
                  }
                  placeholder="Ví dụ: Đỏ, Xanh, 128GB"
                  required
                />
              </div>

              {newAttribute.name === "Màu sắc" && (
                <div>
                  <label className="font-medium">Mã Màu</label>
                  <input
                    type="color"
                    className="w-16 h-10 mt-1 border"
                    value={newAttribute.colorCode}
                    onChange={(e) =>
                      setNewAttribute({
                        ...newAttribute,
                        colorCode: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Thêm
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 space-y-6 max-w-4xl">
            {attributes.length === 0 ? (
              <p className="text-gray-500">Không có thuộc tính nào.</p>
            ) : (
              attributes.map((attr) => (
                <div
                  key={attr._id}
                  className="bg-white rounded shadow p-4 flex justify-between items-start"
                >
                  <div>
                    <p className="font-semibold">{attr.name}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {attr.values.map((v, i) => {
                        const isEditing =
                          editingAttrId === attr._id && editIndex === i;

                        if (attr.name === "Màu sắc") {
                          return (
                            <div
                              key={i}
                              className="flex flex-col items-start border px-3 py-2 rounded"
                            >
                              <div className="flex gap-2 items-center">
                                <span
                                  className="w-4 h-4 rounded-full inline-block border"
                                  style={{ backgroundColor: v.color }}
                                ></span>
                                <span>{v.text}</span>
                                <button
                                  onClick={() => {
                                    setEditingAttrId(attr._id);
                                    setEditIndex(i);
                                    setEditingValue(v.text);
                                    setEditingColor(v.color);
                                  }}
                                  className="text-blue-600 text-xs hover:underline"
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteValue(attr._id, i)}
                                  className="text-red-500 text-xs hover:underline"
                                >
                                  Xóa
                                </button>
                              </div>

                              {isEditing && (
                                <form
                                  onSubmit={(e) =>
                                    handleUpdateValue(e, attr._id, i, attr.name)
                                  }
                                  className="flex items-center gap-2 mt-2"
                                >
                                  <input
                                    value={editingValue}
                                    onChange={(e) =>
                                      setEditingValue(e.target.value)
                                    }
                                    className="border px-2 py-1 text-sm rounded"
                                  />
                                  <input
                                    type="color"
                                    value={editingColor}
                                    onChange={(e) =>
                                      setEditingColor(e.target.value)
                                    }
                                  />
                                  <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingAttrId(null);
                                      setEditIndex(null);
                                    }}
                                    className="text-gray-500 text-sm"
                                  >
                                    Hủy
                                  </button>
                                </form>
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <div key={i} className="flex items-center gap-2">
                              {isEditing ? (
                                <form
                                  onSubmit={(e) =>
                                    handleUpdateValue(e, attr._id, i, attr.name)
                                  }
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    value={editingValue}
                                    onChange={(e) =>
                                      setEditingValue(e.target.value)
                                    }
                                    className="border px-2 py-1 text-sm rounded"
                                  />
                                  <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingAttrId(null);
                                      setEditIndex(null);
                                    }}
                                    className="text-gray-500 text-sm"
                                  >
                                    Hủy
                                  </button>
                                </form>
                              ) : (
                                <>
                                  <span className="bg-gray-200 text-sm px-3 py-1 rounded">
                                    {v}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingAttrId(attr._id);
                                      setEditIndex(i);
                                      setEditingValue(v);
                                    }}
                                    className="text-blue-600 text-xs hover:underline"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteValue(attr._id, i)
                                    }
                                    className="text-red-500 text-xs hover:underline"
                                  >
                                    Xóa
                                  </button>
                                </>
                              )}
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAttribute(attr._id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Xóa
                  </button>
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
