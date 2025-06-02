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
//   });
//   const [editingItem, setEditingItem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const token = await getToken();
//       console.log("Token:", token); // Kiểm tra token
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
//       else {
//         console.error("Failed to fetch categories:", catRes.data.message);
//         console.error("Failed to fetch brands:", brandRes.data.message);
//       }
//     } catch (error) {
//       console.error("Fetch error:", error.response?.data);
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
//         { ...newItem },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (data.success) {
//         toast.success(
//           `Thêm ${newItem.type === "category" ? "loại" : "hãng"} thành công`
//         );
//         newItem.type === "category"
//           ? setCategories([...categories, data.item])
//           : setBrands([...brands, data.item]);
//         setNewItem({ type: "category", name: "", description: "" });
//       } else {
//         toast.error(data.message || "Lỗi khi thêm");
//       }
//     } catch (error) {
//       console.error("Add error:", error.response?.data);
//       toast.error(error.response?.data?.message || "Lỗi khi thêm");
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
//     });
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
//       const { data } = await axios.put(
//         "/api/seller/manage",
//         {
//           ...editingItem,
//           name: newItem.name,
//           description: newItem.description,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (data.success) {
//         toast.success(
//           `Cập nhật ${newItem.type === "category" ? "loại" : "hãng"} thành công`
//         );
//         fetchData();
//         setEditingItem(null);
//         setNewItem({ type: "category", name: "", description: "" });
//       } else {
//         toast.error(data.message || "Lỗi khi cập nhật");
//       }
//     } catch (error) {
//       console.error("Update error:", error.response?.data);
//       toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
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
//       console.error("Delete error:", error.response?.data);
//       toast.error(error.response?.data?.message || "Lỗi khi xóa");
//       fetchData();
//     } finally {
//       setActionLoading(false);
//     }
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
//               setNewItem({ type: "category", name: "", description: "" });
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
//                   {brand.name} - {brand.description}
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
// app/seller/manage-categories-brands
// app/seller/manage-categories-brands
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

const ManageCategoriesBrands = () => {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [newItem, setNewItem] = useState({
    type: "category",
    name: "",
    description: "",
    selectedCategories: [], // Danh sách Category đã chọn
  });
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState(""); // Để chọn Category mới

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        return;
      }
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
    } catch (error) {
      console.error("Fetch error:", error.response?.data);
      toast.error(
        "Lỗi khi tải dữ liệu: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      toast.error("Tên không được để trống");
      return;
    }
    try {
      setActionLoading(true);
      const token = await getToken();
      const { data } = await axios.post(
        "/api/seller/manage",
        {
          type: newItem.type,
          name: newItem.name,
          description: newItem.description,
          categoryIds:
            newItem.type === "brand" ? newItem.selectedCategories : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(
          `Thêm ${newItem.type === "category" ? "loại" : "hãng"} thành công`
        );
        if (newItem.type === "category") {
          setCategories([...categories, data.item]);
        } else {
          setBrands([...brands, data.item]);
        }
        setNewItem({
          type: "category",
          name: "",
          description: "",
          selectedCategories: [],
        });
        setNewCategoryId("");
      } else {
        toast.error(data.message || "Lỗi khi thêm");
      }
    } catch (error) {
      console.error("Add error:", error.response?.data);
      toast.error(error.response?.data?.message || "Lỗi khi thêm");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem({ ...item, type: item.categoryId ? "category" : "brand" });
    setNewItem({
      type: item.categoryId ? "category" : "brand",
      name: item.name,
      description: item.description,
      selectedCategories:
        item.categoryIds || (item.categories || []).map((cat) => cat._id),
    });
    setNewCategoryId("");
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      toast.error("Tên không được để trống");
      return;
    }
    try {
      setActionLoading(true);
      const token = await getToken();
      const { data } = await axios.put(
        "/api/seller/manage",
        {
          _id: editingItem._id,
          type: newItem.type,
          name: newItem.name,
          description: newItem.description,
          categoryIds:
            newItem.type === "brand" ? newItem.selectedCategories : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(
          `Cập nhật ${newItem.type === "category" ? "loại" : "hãng"} thành công`
        );
        fetchData();
        setEditingItem(null);
        setNewItem({
          type: "category",
          name: "",
          description: "",
          selectedCategories: [],
        });
        setNewCategoryId("");
      } else {
        toast.error(data.message || "Lỗi khi cập nhật");
      }
    } catch (error) {
      console.error("Update error:", error.response?.data);
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (id, type) => {
    if (
      !confirm(
        `Bạn có chắc muốn xóa ${type === "category" ? "loại" : "hãng"} này?`
      )
    )
      return;
    try {
      setActionLoading(true);
      const token = await getToken();
      const { data } = await axios.delete("/api/seller/manage", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id, type },
      });
      if (data.success) {
        toast.success(
          `Xóa ${type === "category" ? "loại" : "hãng"} thành công`
        );
        type === "category"
          ? setCategories(categories.filter((c) => c._id !== id))
          : setBrands(brands.filter((b) => b._id !== id));
      } else {
        toast.error(data.message || "Lỗi khi xóa");
      }
    } catch (error) {
      console.error("Delete error:", error.response?.data);
      toast.error(error.response?.data?.message || "Lỗi khi xóa");
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  // Thêm Category vào danh sách đã chọn
  const handleAddCategory = () => {
    if (!newCategoryId) {
      toast.error("Vui lòng chọn một loại để thêm");
      return;
    }
    if (newItem.selectedCategories.includes(newCategoryId)) {
      toast.error("Loại này đã được chọn");
      return;
    }
    setNewItem({
      ...newItem,
      selectedCategories: [...newItem.selectedCategories, newCategoryId],
    });
    setNewCategoryId("");
  };

  // Xóa Category khỏi danh sách đã chọn
  const handleRemoveCategory = (categoryId) => {
    setNewItem({
      ...newItem,
      selectedCategories: newItem.selectedCategories.filter(
        (id) => id !== categoryId
      ),
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">Quản lý Loại và Hãng</h2>

      {/* Form thêm/sửa */}
      <form
        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
        className="space-y-4 mb-6 border p-4 rounded"
      >
        <div>
          <label className="block">Loại/Danh mục</label>
          <select
            value={newItem.type}
            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            className="border p-2 rounded w-full"
            disabled={actionLoading}
          >
            <option value="category">Loại</option>
            <option value="brand">Hãng</option>
          </select>
        </div>
        <div>
          <label className="block">Tên</label>
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="border p-2 rounded w-full"
            required
            disabled={actionLoading}
          />
        </div>
        <div>
          <label className="block">Mô tả</label>
          <input
            type="text"
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
            className="border p-2 rounded w-full"
            disabled={actionLoading}
          />
        </div>
        {newItem.type === "brand" && (
          <div>
            <label className="block">Thuộc các loại</label>
            {/* Hiển thị danh sách Category đã chọn */}
            <div className="mb-2">
              {newItem.selectedCategories.length > 0 ? (
                <ul className="space-y-1">
                  {newItem.selectedCategories.map((categoryId) => {
                    const category = categories.find(
                      (cat) => cat._id === categoryId
                    );
                    return (
                      <li
                        key={categoryId}
                        className="flex items-center justify-between border p-1 rounded"
                      >
                        <span>
                          {category ? category.name : "Không xác định"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(categoryId)}
                          className="bg-red-500 text-white p-1 rounded text-sm"
                          disabled={actionLoading}
                        >
                          Xóa
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Chưa có loại nào được chọn
                </p>
              )}
            </div>
            {/* Thêm Category mới */}
            <div className="flex items-center space-x-2">
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="border p-2 rounded w-full"
                disabled={actionLoading}
              >
                <option value="">Chọn loại để thêm</option>
                {categories
                  .filter(
                    (cat) => !newItem.selectedCategories.includes(cat._id)
                  )
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-green-500 text-white p-2 rounded"
                disabled={actionLoading}
              >
                Thêm loại
              </button>
            </div>
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded"
          disabled={actionLoading}
        >
          {actionLoading
            ? "Đang xử lý..."
            : editingItem
            ? "Cập nhật"
            : "Thêm mới"}
        </button>
        {editingItem && (
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setNewItem({
                type: "category",
                name: "",
                description: "",
                selectedCategories: [],
              });
              setNewCategoryId("");
            }}
            className="bg-gray-500 text-white p-2 rounded ml-2"
            disabled={actionLoading}
          >
            Hủy
          </button>
        )}
      </form>

      {/* Danh sách Loại */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Danh sách Loại</h3>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat._id} className="border p-2 flex justify-between">
                <span>
                  {cat.name} - {cat.description}
                </span>
                <div>
                  <button
                    onClick={() => handleEditItem(cat)}
                    className="bg-blue-500 text-white p-1 rounded mr-2"
                    disabled={actionLoading}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteItem(cat._id, "category")}
                    className="bg-red-500 text-white p-1 rounded"
                    disabled={actionLoading}
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Danh sách Hãng */}
      <div>
        <h3 className="text-md font-medium mb-2">Danh sách Hãng</h3>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <ul className="space-y-2">
            {brands.map((brand) => (
              <li key={brand._id} className="border p-2 flex justify-between">
                <span>
                  {brand.name} - {brand.description} -{" "}
                  {(brand.categories || []).map((cat) => cat.name).join(", ") ||
                    "Không thuộc loại nào"}
                </span>
                <div>
                  <button
                    onClick={() => handleEditItem(brand)}
                    className="bg-blue-500 text-white p-1 rounded mr-2"
                    disabled={actionLoading}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteItem(brand._id, "brand")}
                    className="bg-red-500 text-white p-1 rounded"
                    disabled={actionLoading}
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageCategoriesBrands;
