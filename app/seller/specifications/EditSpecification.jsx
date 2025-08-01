"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { set } from "lodash";
import { toast } from "react-hot-toast";

const EditSpecification = ({ productId, categoryId, editingSpec, onClose }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({ key: "", value: "" });
  const [suggestedKeys, setSuggestedKeys] = useState([]);
  const [valueType, setValueType] = useState("string");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  useEffect(() => {
    if (editingSpec) {
      setFormData({ key: editingSpec.key, value: editingSpec.value });
    }
  }, [editingSpec]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const { data } = await axios.get(
          `/api/specification-template?categoryId=${categoryId}`
        );
        if (data.success && data.templates.length > 0) {
          setSuggestedKeys(data.templates[0].specs);
        }
      } catch (error) {
        console.error("Error fetching template:", error);
      }
    };
    fetchTemplate();
  }, [categoryId]);

  useEffect(() => {
    const selected = suggestedKeys.find((spec) => spec.name === formData.key);
    if (selected) {
      setValueType(selected.type);
      if (selected.type === "array" && !Array.isArray(formData.value)) {
        setFormData({ ...formData, value: [formData.value || ""] });
      }
    }
  }, [formData.key, suggestedKeys]);

  const handleArrayChange = (index, value) => {
    const updated = [...formData.value];
    updated[index] = value;
    setFormData({ ...formData, value: updated });
  };

  const handleAddArrayItem = () => {
    setFormData({ ...formData, value: [...formData.value, ""] });
  };

  const handleRemoveArrayItem = (index) => {
    if (formData.value.length > 1) {
      const updated = formData.value.filter((_, i) => i !== index);
      setFormData({ ...formData, value: updated });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let valueToSubmit = formData.value;

      if (valueType === "number") {
        valueToSubmit = Number(valueToSubmit);
        if (isNaN(valueToSubmit)) {
          setError("Giá trị phải là số.");
          setShowError(true);
          return;
        }
      }

      if (valueType === "array") {
        valueToSubmit = valueToSubmit.filter((v) => v.trim() !== "");
        if (!valueToSubmit.length) {
          setError("Vui lòng nhập ít nhất 1 giá trị.");
          setShowError(true);
          return;
        }
      }

      if (valueType === "string") {
        if (!valueToSubmit || valueToSubmit.trim() === "") {
          setError("vui lòng nhập giá trị vào");
          setShowError(true);
          return;
        }
      }

      const res = await axios.put(`/api/specification/${productId}`, {
        specId: editingSpec._id,
        key: formData.key,
        value: valueToSubmit,
      });

      if (res.data.success) {
        toast.success("✅ Cập nhật thông số thành công!");
        onClose();
        router.refresh();
      } else {
        setError(res.data.message || "Lỗi không xác định");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-yellow-500 text-xl"></span> Chỉnh sửa Thông Số
          </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="px-6 py-4 overflow-y-auto flex-1">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Tên Thông Số
              </label>
              <input
                type="text"
                value={formData.key}
                disabled
                className="w-full p-2 border rounded bg-gray-100 text-gray-600"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Giá Trị</label>
              {valueType === "array" ? (
                <div className="space-y-2">
                  {formData.value.map((val, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={val}
                        onChange={(e) =>
                          handleArrayChange(index, e.target.value)
                        }
                        className="flex-1 p-2 border rounded"
                        placeholder={`Giá trị ${index + 1}`}
                      />
                      {formData.value.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          X
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddArrayItem}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Thêm giá trị
                  </button>
                </div>
              ) : (
                <input
                  type={valueType === "number" ? "number" : "text"}
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              )}
              {showError &&
                (!formData.value || !formData.value.trim() === "") && (
                  <p className="text-red-500 text-xs mt-1">
                    vui lòng không để trống
                  </p>
                )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t bg-white flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSpecification;
