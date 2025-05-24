// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// const AddSpecification = ({ productId, categoryId, onClose }) => {
//   const router = useRouter();
//   const [formData, setFormData] = useState({ key: "", value: "" });
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post("/api/specificationM", {
//         productId,
//         categoryId,
//         key: formData.key,
//         value: formData.value,
//       });
//       if (response.data.success) {
//         alert("Thêm thông số thành công!");
//         onClose(); // Đóng form hoặc reload danh sách
//         router.refresh(); // Tải lại trang
//       }
//     } catch (error) {
//       setError("Lỗi khi thêm thông số: " + error.message);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg w-full max-w-md">
//         <h2 className="text-xl font-medium mb-4">Thêm Thông Số Kỹ Thuật</h2>
//         {error && <p className="text-red-500 mb-2">{error}</p>}
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">
//               Tên Thông Số
//             </label>
//             <input
//               type="text"
//               value={formData.key}
//               onChange={(e) =>
//                 setFormData({ ...formData, key: e.target.value })
//               }
//               className="w-full p-2 border rounded"
//               placeholder="Ví dụ: RAM"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Giá Trị</label>
//             <input
//               type="text"
//               value={formData.value}
//               onChange={(e) =>
//                 setFormData({ ...formData, value: e.target.value })
//               }
//               className="w-full p-2 border rounded"
//               placeholder="Ví dụ: 16GB"
//             />
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 bg-gray-300 rounded"
//             >
//               Hủy
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-500 text-white rounded"
//             >
//               Thêm
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddSpecification;
// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// const AddSpecification = ({ productId, categoryId, onClose }) => {
//   const router = useRouter();
//   const [formData, setFormData] = useState({ key: "", value: "" });
//   const [error, setError] = useState("");
//   const [suggestedKeys, setSuggestedKeys] = useState([]);

//   useEffect(() => {
//     const fetchTemplate = async () => {
//       if (categoryId) {
//         try {
//           const { data } = await axios.get(
//             `/api/specification-template?categoryId=${categoryId}`
//           );
//           if (data.success && data.templates.length > 0) {
//             setSuggestedKeys(data.templates[0].specs.map((spec) => spec.name));
//           }
//         } catch (error) {
//           console.error("Fetch Template Error:", error.message);
//         }
//       }
//     };
//     fetchTemplate();
//   }, [categoryId]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const response = await axios.post("/api/specificationM", {
//         productId,
//         categoryId,
//         key: formData.key,
//         value: formData.value,
//       });
//       if (response.data.success) {
//         alert("Thêm thông số thành công!");
//         onClose();
//         router.refresh();
//       } else {
//         setError(response.data.message || "Lỗi không xác định");
//       }
//     } catch (error) {
//       setError(
//         error.response?.data?.message ||
//           "Lỗi khi thêm thông số: " + error.message
//       );
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg w-full max-w-md">
//         <h2 className="text-xl font-medium mb-4">Thêm Thông Số Kỹ Thuật</h2>
//         {error && <p className="text-red-500 mb-2">{error}</p>}
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">
//               Tên Thông Số
//             </label>
//             <select
//               value={formData.key}
//               onChange={(e) =>
//                 setFormData({ ...formData, key: e.target.value })
//               }
//               className="w-full p-2 border rounded"
//             >
//               <option value="">-- Chọn hoặc nhập thông số --</option>
//               {suggestedKeys.map((key, index) => (
//                 <option key={index} value={key}>
//                   {key}
//                 </option>
//               ))}
//               <option value={formData.key}>Tùy chỉnh: {formData.key}</option>
//             </select>
//             <input
//               type="text"
//               value={formData.key}
//               onChange={(e) =>
//                 setFormData({ ...formData, key: e.target.value })
//               }
//               className="w-full p-2 border rounded mt-1"
//               placeholder="Nhập tên thông số (VD: RAM)"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Giá Trị</label>
//             <input
//               type="text"
//               value={formData.value}
//               onChange={(e) =>
//                 setFormData({ ...formData, value: e.target.value })
//               }
//               className="w-full p-2 border rounded"
//               placeholder="Ví dụ: 16GB"
//             />
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 bg-gray-300 rounded"
//             >
//               Hủy
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-500 text-white rounded"
//             >
//               Thêm
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddSpecification;
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const AddSpecification = ({ productId, categoryId, onClose }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({ key: "", value: "" });
  const [error, setError] = useState("");
  const [suggestedKeys, setSuggestedKeys] = useState([]);
  const [valueType, setValueType] = useState("string");

  useEffect(() => {
    const fetchTemplate = async () => {
      if (categoryId) {
        try {
          const { data } = await axios.get(`/api/specification-template?categoryId=${categoryId}`);
          if (data.success && data.templates.length > 0) {
            setSuggestedKeys(data.templates[0].specs);
          }
        } catch (error) {
          console.error("Fetch Template Error:", error.message);
        }
      }
    };
    fetchTemplate();
  }, [categoryId]);

  useEffect(() => {
    const selectedSpec = suggestedKeys.find((spec) => spec.name === formData.key);
    if (selectedSpec) {
      setValueType(selectedSpec.type);
      if (selectedSpec.type === "array") {
        setFormData({ ...formData, value: [""] }); // Khởi tạo mảng với 1 phần tử rỗng
      } else {
        setFormData({ ...formData, value: "" });
      }
    }
  }, [formData.key, suggestedKeys]);

  const handleArrayValueChange = (index, value) => {
    const newArray = [...formData.value];
    newArray[index] = value;
    setFormData({ ...formData, value: newArray });
  };

  const handleAddArrayItem = () => {
    setFormData({ ...formData, value: [...formData.value, ""] });
  };

  const handleRemoveArrayItem = (index) => {
    if (formData.value.length > 1) {
      const newArray = formData.value.filter((_, i) => i !== index);
      setFormData({ ...formData, value: newArray });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let valueToSubmit = formData.value;
      if (valueType === "number") {
        valueToSubmit = Number(formData.value);
        if (isNaN(valueToSubmit)) {
          setError("Giá trị phải là một số hợp lệ.");
          return;
        }
      }
      if (valueType === "array") {
        // Loại bỏ các giá trị rỗng trong mảng
        valueToSubmit = formData.value.filter((item) => item.trim() !== "");
        if (valueToSubmit.length === 0) {
          setError("Vui lòng nhập ít nhất một giá trị cho mảng.");
          return;
        }
      }
      const response = await axios.post("/api/specificationM", {
        productId,
        categoryId,
        key: formData.key,
        value: valueToSubmit,
      });
      if (response.data.success) {
        alert("Thêm thông số thành công!");
        onClose();
        router.refresh();
      } else {
        setError(response.data.message || "Lỗi không xác định");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Lỗi khi thêm thông số: " + error.message
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-medium mb-4">Thêm Thông Số Kỹ Thuật</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tên Thông Số</label>
            <select
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Chọn thông số --</option>
              {suggestedKeys.map((spec, index) => (
                <option key={index} value={spec.name}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Giá Trị</label>
            {valueType === "array" ? (
              <div>
                {formData.value.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayValueChange(index, e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder={`Giá trị ${index + 1} (VD: Khử tiếng ồn chủ động...)`}
                    />
                    {formData.value.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddArrayItem}
                  className="px-2 py-1 bg-blue-500 text-white rounded mt-1"
                >
                  Thêm giá trị
                </button>
              </div>
            ) : (
              <input
                type={valueType === "number" ? "number" : "text"}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder={
                  valueType === "number"
                    ? "Ví dụ: 5000"
                    : valueType === "string"
                    ? "Ví dụ: 16GB"
                    : ""
                }
              />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={!formData.key}
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSpecification;