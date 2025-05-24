"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const ManageSpecificationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [specs, setSpecs] = useState([{ name: "", type: "string" }]);
  const [error, setError] = useState("");
  const [editingTemplate, setEditingTemplate] = useState(null); // State để theo dõi template đang sửa

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/list");
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      setError("Lỗi khi tải danh mục: " + err.message);
    }
  };

  // Lấy danh sách template
  const fetchTemplates = async () => {
    try {
      const { data } = await axios.get("/api/specification-template");
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      setError("Lỗi khi tải templates: " + err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTemplates();
  }, []);

  const handleAddSpecField = () => {
    setSpecs([...specs, { name: "", type: "string" }]);
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { categoryId, specs };
      if (editingTemplate) {
        // Cập nhật template
        const response = await axios.put(
          `/api/specification-template?categoryId=${editingTemplate.categoryId}`,
          payload
        );
        if (response.data.success) {
          alert("Cập nhật template thành công!");
          setEditingTemplate(null);
          fetchTemplates();
          setCategoryId("");
          setSpecs([{ name: "", type: "string" }]);
        }
      } else {
        // Tạo mới template
        const response = await axios.post(
          "/api/specification-template",
          payload
        );
        if (response.data.success) {
          alert("Thêm template thành công!");
          fetchTemplates();
          setCategoryId("");
          setSpecs([{ name: "", type: "string" }]);
        }
      }
    } catch (err) {
      setError("Lỗi khi lưu template: " + err.message);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setCategoryId(template.categoryId);
    setSpecs(template.specs.map((spec) => ({ ...spec }))); // Sao chép specs để chỉnh sửa
  };

  const handleDelete = async (categoryId) => {
    if (confirm("Bạn có chắc chắn muốn xóa template này?")) {
      try {
        const response = await axios.delete(
          `/api/specification-template?categoryId=${categoryId}`
        );
        if (response.data.success) {
          fetchTemplates();
        }
      } catch (err) {
        setError("Lỗi khi xóa template: " + err.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setCategoryId("");
    setSpecs([{ name: "", type: "string" }]);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium mb-4">Quản Lý Template Thông Số</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Chọn Danh Mục
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="p-2 border rounded w-full"
            disabled={editingTemplate} // Vô hiệu hóa khi đang sửa
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {specs.map((spec, index) => (
          <div key={index} className="mb-2 flex gap-2">
            <input
              type="text"
              value={spec.name}
              onChange={(e) => handleSpecChange(index, "name", e.target.value)}
              placeholder="Tên thông số (VD: Thời lượng pin)"
              className="p-2 border rounded flex-1"
            />
            <select
              value={spec.type}
              onChange={(e) => handleSpecChange(index, "type", e.target.value)}
              className="p-2 border rounded"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="array">Array</option>
            </select>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddSpecField}
          className="px-4 py-2 bg-blue-500 text-white rounded mb-2"
        >
          Thêm Thông Số Khác
        </button>
        {editingTemplate ? (
          <>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded ml-2"
            >
              Lưu Thay Đổi
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-500 text-white rounded ml-2"
            >
              Hủy
            </button>
          </>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded ml-2"
            disabled={!categoryId}
          >
            Lưu Template
          </button>
        )}
      </form>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Category ID</th>
            <th className="p-2 border">Thông Số</th>
            <th className="p-2 border">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template._id} className="border-t">
              <td className="p-2 border">
                {categories.find((cat) => cat._id === template.categoryId)
                  ?.name || template.categoryId}
              </td>
              <td className="p-2 border">
                {template.specs.map((spec, idx) => (
                  <div key={idx}>
                    {spec.name} ({spec.type})
                  </div>
                ))}
              </td>
              <td className="p-2 border">
                <button
                  onClick={() => handleEdit(template)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(template.categoryId)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageSpecificationTemplates;
