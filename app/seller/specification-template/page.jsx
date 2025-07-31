"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ManageSpecificationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [specs, setSpecs] = useState([{ name: "", type: "string" }]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showError, setShowError] = useState(false);
  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/list");
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      toast.error("Lỗi khi tải danh mục: " + err.message);
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
      toast.error("Lỗi khi tải templates: " + err.message);
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

  const handleRemoveSpec = (index) => {
    if (specs.length > 1) {
      setSpecs(specs.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!categoryId || specs.some((spec) => !spec.name.trim())) {
        setShowError(true);
        return toast.error("Vui lòng điền đầy đủ thông tin");
      }

      const payload = { categoryId, specs };
      if (editingTemplate) {
        // Cập nhật template
        const response = await axios.put(
          `/api/specification-template?categoryId=${editingTemplate.categoryId}`,
          payload
        );
        if (response.data.success) {
          toast.success("Cập nhật template thành công!");
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
          toast.success("Thêm template thành công!");
          fetchTemplates();
          setCategoryId("");
          setSpecs([{ name: "", type: "string" }]);
        }
      }
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Lỗi khi lưu template: " + err.message);
      }
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setCategoryId(template.categoryId);
    setSpecs(template.specs.map((spec) => ({ ...spec })));
  };

  const handleDelete = async (categoryId) => {
    if (confirm("Bạn có chắc chắn muốn xóa template này?")) {
      try {
        const response = await axios.delete(
          `/api/specification-template?categoryId=${categoryId}`
        );
        if (response.data.success) {
          toast.success("Xóa template thành công!");
          fetchTemplates();
        }
      } catch (err) {
        toast.error("Lỗi khi xóa template: " + err.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setCategoryId("");
    setSpecs([{ name: "", type: "string" }]);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "string":
        return "bg-blue-100 text-blue-800";
      case "number":
        return "bg-green-100 text-green-800";
      case "array":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Template Thông Số
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            {editingTemplate ? "Chỉnh Sửa Template" : "Thêm Template Mới"}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn Danh Mục
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={editingTemplate}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {showError && !categoryId && (
                <p className="text-red-500 text-xs mt-1">
                  vui lòng chọn danh mục
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thông Số Kỹ Thuật
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {specs.map((spec, index) => (
                  <div key={index}>
                    <div className="flex gap-1 items-center">
                      <input
                        type="text"
                        value={spec.name}
                        onChange={(e) => {
                          handleSpecChange(index, "name", e.target.value);
                          setShowError(false);
                        }}
                        placeholder="Tên thông số"
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                      <select
                        value={spec.type}
                        onChange={(e) =>
                          handleSpecChange(index, "type", e.target.value)
                        }
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="array">Array</option>
                      </select>
                      {specs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {showError && !spec.name.trim() && (
                      <p className="text-red-500 text-xs mt-1">
                        vui lòng không để trống
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddSpecField}
                className="w-full mt-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
              >
                + Thêm Thông Số Khác
              </button>
            </div>

            <div className="flex gap-2">
              {editingTemplate ? (
                <>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                  >
                    Lưu Thay Đổi
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:bg-gray-300 text-sm"
                  disabled={!categoryId}
                >
                  Lưu Template
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Templates List Section */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            Danh Sách Templates
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template._id}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm">
                      {categories.find((cat) => cat._id === template.categoryId)
                        ?.name || template.categoryId}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {template.specs.length} thông số
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(template)}
                      className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(template.categoryId)}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.specs.map((spec, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                        spec.type
                      )}`}
                    >
                      {spec.name} ({spec.type})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSpecificationTemplates;
