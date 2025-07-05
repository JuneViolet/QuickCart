// // app/seller/manage-categories-brands
// "use client";
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useAuth } from "@clerk/nextjs";

// const ManageCategoriesBrands = () => {
//   const { getToken } = useAuth();
//   const [categories, setCategories] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [newItem, setNewItem] = useState({
//     type: "category",
//     name: "",
//     description: "",
//     selectedCategories: [],
//   });
//   const [editingItem, setEditingItem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [newCategoryId, setNewCategoryId] = useState("");

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const token = await getToken();
//       if (!token) {
//         toast.error("Vui lòng đăng nhập để tiếp tục.");
//         return;
//       }
//       const [catRes, brandRes] = await Promise.all([
//         axios.get("/api/seller/manage", {
//           headers: { Authorization: `Bearer ${token}` },
//           params: { type: "categories" },
//         }),
//         axios.get("/api/seller/manage", {
//           headers: { Authorization: `Bearer ${token}` },
//           params: { type: "brands" },
//         }),
//       ]);
//       if (catRes.data.success) setCategories(catRes.data.items);
//       if (brandRes.data.success) setBrands(brandRes.data.items);
//     } catch (error) {
//       console.error("Fetch error:", error.response?.data || error.message);
//       toast.error(
//         "Lỗi khi tải dữ liệu: " +
//           (error.response?.data?.message || error.message)
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddItem = async (e) => {
//     e.preventDefault();
//     if (!newItem.name.trim()) {
//       toast.error("Tên không được để trống");
//       return;
//     }
//     try {
//       setActionLoading(true);
//       const token = await getToken();
//       const { data } = await axios.post(
//         "/api/seller/manage",
//         {
//           type: newItem.type,
//           name: newItem.name,
//           description: newItem.description,
//           categoryIds:
//             newItem.type === "brand" ? newItem.selectedCategories : undefined,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (data.success) {
//         toast.success(
//           `Thêm ${newItem.type === "category" ? "loại" : "hãng"} thành công`
//         );
//         if (newItem.type === "category") {
//           setCategories([...categories, data.item]);
//         } else {
//           setBrands([...brands, data.item]);
//         }
//         setNewItem({
//           type: "category",
//           name: "",
//           description: "",
//           selectedCategories: [],
//         });
//         setNewCategoryId("");
//       } else {
//         toast.error(data.message || "Lỗi khi thêm");
//       }
//     } catch (error) {
//       console.error("Add error:", error.response?.data || error.message);
//       toast.error(
//         "Lỗi khi thêm: " +
//           (error.response?.data?.message || error.message || "Không xác định")
//       );
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleEditItem = (item) => {
//     setEditingItem({ ...item, type: item.categoryId ? "category" : "brand" });
//     setNewItem({
//       type: item.categoryId ? "category" : "brand",
//       name: item.name,
//       description: item.description,
//       selectedCategories:
//         item.categoryIds || (item.categories || []).map((cat) => cat._id),
//     });
//     setNewCategoryId("");
//   };

//   const handleUpdateItem = async (e) => {
//     e.preventDefault();
//     if (!newItem.name.trim()) {
//       toast.error("Tên không được để trống");
//       return;
//     }
//     try {
//       setActionLoading(true);
//       const token = await getToken();
//       console.log("Update data sent:", {
//         _id: editingItem._id,
//         type: newItem.type,
//         name: newItem.name,
//         description: newItem.description,
//         categoryIds:
//           newItem.type === "brand" ? newItem.selectedCategories : undefined,
//       });
//       const { data } = await axios.put(
//         "/api/seller/manage",
//         {
//           _id: editingItem._id,
//           type: newItem.type,
//           name: newItem.name,
//           description: newItem.description,
//           categoryIds:
//             newItem.type === "brand" ? newItem.selectedCategories : undefined,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (data.success) {
//         toast.success(
//           `Cập nhật ${newItem.type === "category" ? "loại" : "hãng"} thành công`
//         );
//         fetchData();
//         setEditingItem(null);
//         setNewItem({
//           type: "category",
//           name: "",
//           description: "",
//           selectedCategories: [],
//         });
//         setNewCategoryId("");
//       } else {
//         toast.error(data.message || "Lỗi khi cập nhật");
//       }
//     } catch (error) {
//       console.error("Update error:", error.response?.data || error.message);
//       toast.error(
//         "Lỗi khi cập nhật: " +
//           (error.response?.data?.message || error.message || "Không xác định")
//       );
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleDeleteItem = async (id, type) => {
//     if (
//       !confirm(
//         `Bạn có chắc muốn xóa ${type === "category" ? "loại" : "hãng"} này?`
//       )
//     )
//       return;
//     try {
//       setActionLoading(true);
//       const token = await getToken();
//       const { data } = await axios.delete("/api/seller/manage", {
//         headers: { Authorization: `Bearer ${token}` },
//         data: { id, type },
//       });
//       if (data.success) {
//         toast.success(
//           `Xóa ${type === "category" ? "loại" : "hãng"} thành công`
//         );
//         type === "category"
//           ? setCategories(categories.filter((c) => c._id !== id))
//           : setBrands(brands.filter((b) => b._id !== id));
//       } else {
//         toast.error(data.message || "Lỗi khi xóa");
//       }
//     } catch (error) {
//       console.error("Delete error:", error.response?.data || error.message);
//       toast.error(
//         "Lỗi khi xóa: " +
//           (error.response?.data?.message || error.message || "Không xác định")
//       );
//       fetchData();
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleAddCategory = () => {
//     if (!newCategoryId) {
//       toast.error("Vui lòng chọn một loại để thêm");
//       return;
//     }
//     if (newItem.selectedCategories.includes(newCategoryId)) {
//       toast.error("Loại này đã được chọn");
//       return;
//     }
//     setNewItem({
//       ...newItem,
//       selectedCategories: [...newItem.selectedCategories, newCategoryId],
//     });
//     setNewCategoryId("");
//   };

//   const handleRemoveCategory = (categoryId) => {
//     setNewItem({
//       ...newItem,
//       selectedCategories: newItem.selectedCategories.filter(
//         (id) => id !== categoryId
//       ),
//     });
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <div className="p-4">
//       <h2 className="text-lg font-medium mb-4">Quản lý Loại và Hãng</h2>

//       {/* Form thêm/sửa */}
//       <form
//         onSubmit={editingItem ? handleUpdateItem : handleAddItem}
//         className="space-y-4 mb-6 border p-4 rounded"
//       >
//         <div>
//           <label className="block">Loại/Danh mục</label>
//           <select
//             value={newItem.type}
//             onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
//             className="border p-2 rounded w-full"
//             disabled={actionLoading}
//           >
//             <option value="category">Loại</option>
//             <option value="brand">Hãng</option>
//           </select>
//         </div>
//         <div>
//           <label className="block">Tên</label>
//           <input
//             type="text"
//             value={newItem.name}
//             onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
//             className="border p-2 rounded w-full"
//             required
//             disabled={actionLoading}
//           />
//         </div>
//         <div>
//           <label className="block">Mô tả</label>
//           <input
//             type="text"
//             value={newItem.description}
//             onChange={(e) =>
//               setNewItem({ ...newItem, description: e.target.value })
//             }
//             className="border p-2 rounded w-full"
//             disabled={actionLoading}
//           />
//         </div>
//         {newItem.type === "brand" && (
//           <div>
//             <label className="block">Thuộc các loại</label>
//             <div className="mb-2">
//               {newItem.selectedCategories.length > 0 ? (
//                 <ul className="space-y-1">
//                   {newItem.selectedCategories.map((categoryId) => {
//                     const category = categories.find(
//                       (cat) => cat._id === categoryId
//                     );
//                     return (
//                       <li
//                         key={categoryId}
//                         className="flex items-center justify-between border p-1 rounded"
//                       >
//                         <span>
//                           {category ? category.name : "Không xác định"}
//                         </span>
//                         <button
//                           type="button"
//                           onClick={() => handleRemoveCategory(categoryId)}
//                           className="bg-red-500 text-white p-1 rounded text-sm"
//                           disabled={actionLoading}
//                         >
//                           Xóa
//                         </button>
//                       </li>
//                     );
//                   })}
//                 </ul>
//               ) : (
//                 <p className="text-sm text-gray-500">
//                   Chưa có loại nào được chọn
//                 </p>
//               )}
//             </div>
//             <div className="flex items-center space-x-2">
//               <select
//                 value={newCategoryId}
//                 onChange={(e) => setNewCategoryId(e.target.value)}
//                 className="border p-2 rounded w-full"
//                 disabled={actionLoading}
//               >
//                 <option value="">Chọn loại để thêm</option>
//                 {categories
//                   .filter(
//                     (cat) => !newItem.selectedCategories.includes(cat._id)
//                   )
//                   .map((cat) => (
//                     <option key={cat._id} value={cat._id}>
//                       {cat.name}
//                     </option>
//                   ))}
//               </select>
//               <button
//                 type="button"
//                 onClick={handleAddCategory}
//                 className="bg-green-500 text-white p-2 rounded"
//                 disabled={actionLoading}
//               >
//                 Thêm loại
//               </button>
//             </div>
//           </div>
//         )}
//         <button
//           type="submit"
//           className="bg-blue-500 text-white p-2 rounded"
//           disabled={actionLoading}
//         >
//           {actionLoading
//             ? "Đang xử lý..."
//             : editingItem
//             ? "Cập nhật"
//             : "Thêm mới"}
//         </button>
//         {editingItem && (
//           <button
//             type="button"
//             onClick={() => {
//               setEditingItem(null);
//               setNewItem({
//                 type: "category",
//                 name: "",
//                 description: "",
//                 selectedCategories: [],
//               });
//               setNewCategoryId("");
//             }}
//             className="bg-gray-500 text-white p-2 rounded ml-2"
//             disabled={actionLoading}
//           >
//             Hủy
//           </button>
//         )}
//       </form>

//       {/* Danh sách Loại */}
//       <div className="mb-6">
//         <h3 className="text-md font-medium mb-2">Danh sách Loại</h3>
//         {loading ? (
//           <p>Đang tải...</p>
//         ) : (
//           <ul className="space-y-2">
//             {categories.map((cat) => (
//               <li key={cat._id} className="border p-2 flex justify-between">
//                 <span>
//                   {cat.name} - {cat.description}
//                 </span>
//                 <div>
//                   <button
//                     onClick={() => handleEditItem(cat)}
//                     className="bg-blue-500 text-white p-1 rounded mr-2"
//                     disabled={actionLoading}
//                   >
//                     Sửa
//                   </button>
//                   <button
//                     onClick={() => handleDeleteItem(cat._id, "category")}
//                     className="bg-red-500 text-white p-1 rounded"
//                     disabled={actionLoading}
//                   >
//                     Xóa
//                   </button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* Danh sách Hãng */}
//       <div>
//         <h3 className="text-md font-medium mb-2">Danh sách Hãng</h3>
//         {loading ? (
//           <p>Đang tải...</p>
//         ) : (
//           <ul className="space-y-2">
//             {brands.map((brand) => (
//               <li key={brand._id} className="border p-2 flex justify-between">
//                 <span>
//                   {brand.name} - {brand.description} -{" "}
//                   {(brand.categories || []).map((cat) => cat.name).join(", ") ||
//                     "Không thuộc loại nào"}
//                 </span>
//                 <div>
//                   <button
//                     onClick={() => handleEditItem(brand)}
//                     className="bg-blue-500 text-white p-1 rounded mr-2"
//                     disabled={actionLoading}
//                   >
//                     Sửa
//                   </button>
//                   <button
//                     onClick={() => handleDeleteItem(brand._id, "brand")}
//                     className="bg-red-500 text-white p-1 rounded"
//                     disabled={actionLoading}
//                   >
//                     Xóa
//                   </button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ManageCategoriesBrands;
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

const ManageCategoriesBrands = () => {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: null,
    categoryIds: [],
  });
  const [editingItem, setEditingItem] = useState(null);
  const [selectedType, setSelectedType] = useState("category");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedBrand, setExpandedBrand] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const [catRes, brandRes] = await Promise.all([
        axios.get("/api/seller/manage", {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: "categories" },
        }),
        axios.get("/api/seller/manage", {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: "brands" },
        }),
      ]);
      if (catRes.data.success) setCategories(catRes.data.items);
      if (brandRes.data.success) setBrands(brandRes.data.items);
    } catch {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () =>
    setFormData({ name: "", description: "", logo: null, categoryIds: [] });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.size > 2 * 1024 * 1024) {
      return toast.error("Logo tối đa 2 MB");
    }
    setFormData({ ...formData, logo: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Tên không được để trống");

    try {
      setActionLoading(true);
      const token = await getToken();
      const form = new FormData();
      form.append("type", selectedType);
      form.append("name", formData.name);
      form.append("description", formData.description);
      if (selectedType === "brand") {
        if (formData.logo) {
          form.append("logo", formData.logo);
        }
        form.append("categoryIds", JSON.stringify(formData.categoryIds));
      }
      if (editingItem) {
        form.append("_id", editingItem._id);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const res = editingItem
        ? await axios.put("/api/seller/manage", form, config)
        : await axios.post("/api/seller/manage", form, config);

      if (res.data.success) {
        toast.success(
          `${editingItem ? "Cập nhật" : "Thêm"} ${
            selectedType === "category" ? "loại" : "hãng"
          } thành công`
        );
        fetchData();
        resetForm();
        setEditingItem(null);
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message || "Lỗi khi lưu");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);

    // Không đổi selectedType để giữ đúng tab người dùng đang chọn
    const isBrand = selectedType === "brand";
    setFormData({
      name: item.name,
      description: item.description,
      logo: null,
      categoryIds: isBrand ? item.categories?.map((c) => c._id) || [] : [],
    });
  };

  const handleDelete = async (item) => {
    if (!confirm("Xác nhận xóa?")) return;
    try {
      setActionLoading(true);
      const token = await getToken();
      const res = await axios.delete("/api/seller/manage", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: item._id, type: selectedType },
      });
      if (res.data.success) {
        toast.success("Xóa thành công");
        fetchData();
      } else {
        throw new Error(res.data.message);
      }
    } catch {
      toast.error("Lỗi khi xóa");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedBrand(expandedBrand === id ? null : id);
  };

  const list = selectedType === "category" ? categories : brands;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Quản lý {selectedType === "category" ? "Loại" : "Hãng"}
      </h2>

      <div className="mb-6 text-center space-x-4">
        {["category", "brand"].map((type) => (
          <button
            key={type}
            onClick={() => {
              setSelectedType(type);
              setEditingItem(null);
              resetForm();
            }}
            className={`px-4 py-2 rounded ${
              selectedType === type ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Quản lý {type === "category" ? "Loại" : "Hãng"}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <input
          type="text"
          required
          placeholder="Tên"
          className="border p-2 rounded"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={actionLoading}
        />
        <input
          type="text"
          placeholder="Mô tả"
          className="border p-2 rounded"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={actionLoading}
        />

        {selectedType === "brand" && (
          <>
            <div>
              <label className="block mb-1">Logo (≤ 2MB)</label>
              {editingItem?.logo && (
                <img
                  src={editingItem.logo}
                  alt="Logo hiện tại"
                  className="h-12 mb-2 object-contain"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={actionLoading}
              />
            </div>

            <div>
              <label className="block mb-1">Loại thuộc về:</label>
              <select
                multiple
                value={formData.categoryIds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoryIds: Array.from(
                      e.target.selectedOptions,
                      (o) => o.value
                    ),
                  })
                }
                className="border p-2 rounded w-full h-24"
                disabled={actionLoading}
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="flex items-start gap-2 lg:col-span-2">
          <button
            type="submit"
            disabled={actionLoading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {editingItem ? "Cập nhật" : "Thêm mới"}
          </button>
          {editingItem && (
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                resetForm();
              }}
              disabled={actionLoading}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-center">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {list.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded shadow flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2">
                {selectedType === "brand" && item.logo && (
                  <img
                    src={item.logo}
                    alt={`${item.name} logo`}
                    className="h-10 w-10 object-contain"
                  />
                )}
                <h3 className="font-semibold">{item.name}</h3>
              </div>
              <p className="text-sm text-gray-600 flex-1">{item.description}</p>
              {selectedType === "brand" && (
                <button
                  onClick={() => toggleExpand(item._id)}
                  className="text-blue-500 text-sm mt-2 self-start"
                >
                  {expandedBrand === item._id ? "Ẩn loại 🎯" : "Xem loại 🎯"}
                </button>
              )}
              {selectedType === "brand" && expandedBrand === item._id && (
                <div className="mt-2 text-xs text-gray-700 space-y-1">
                  <strong>Thuộc loại:</strong>
                  <ul className="list-disc pl-5">
                    {(item.categories || []).map((cat) => (
                      <li key={cat._id}>{cat.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  disabled={actionLoading}
                  className="bg-yellow-400 px-3 py-1 rounded"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={actionLoading}
                  className="bg-red-600 px-3 py-1 rounded text-white"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCategoriesBrands;
