// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useAuth } from "@clerk/nextjs";
// import { assets } from "@/assets/assets";
// import Footer from "@/components/seller/Footer";
// import Loading from "@/components/Loading";

// const Variants = () => {
//   const { getToken, isLoaded } = useAuth();
//   const [variants, setVariants] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isAdding, setIsAdding] = useState(false);
//   const [editingVariant, setEditingVariant] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [newVariantData, setNewVariantData] = useState({
//     productId: "",
//     color: "",
//     storage: "",
//     price: "",
//     offerPrice: "",
//     stock: "",
//     sku: "",
//     image: "",
//   });
//   const [editVariantData, setEditVariantData] = useState({
//     productId: "",
//     color: "",
//     storage: "",
//     price: "",
//     offerPrice: "",
//     stock: "",
//     sku: "",
//     image: "",
//   });

//   const fetchSellerVariants = async () => {
//     try {
//       const token = await getToken();
//       if (!token) {
//         toast.error("Không lấy được token. Hãy đăng nhập lại.");
//         return;
//       }

//       const { data } = await axios.get("/api/variants/manage", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (data.success) {
//         console.log("Fetched Variants:", data.variants);
//         setVariants(data.variants || []);
//       } else {
//         toast.error(data.message || "Không thể tải biến thể");
//       }
//     } catch (error) {
//       console.error("Lỗi khi lấy biến thể:", error);
//       toast.error("Lỗi server. Vui lòng thử lại sau.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get("/api/category/list", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) {
//         setCategories(data.categories || []);
//       } else {
//         toast.error(data.message || "Không thể tải danh mục");
//       }
//     } catch (error) {
//       console.error("Lỗi khi lấy danh mục:", error);
//       toast.error("Lỗi server. Vui lòng thử lại sau.");
//     }
//   };

//   const fetchProductsByCategory = async (categoryId) => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get(`/api/product?category=${categoryId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) {
//         setProducts(data.products || []);
//       } else {
//         toast.error(data.message || "Không thể tải sản phẩm");
//       }
//     } catch (error) {
//       console.error("Lỗi khi lấy sản phẩm:", error);
//       toast.error("Lỗi server. Vui lòng thử lại sau.");
//     }
//   };

//   const handleAddVariant = async (e) => {
//     e.preventDefault();
//     try {
//       const token = await getToken();
//       console.log("Sending add data:", newVariantData);
//       const { data } = await axios.post(
//         "/api/variants/manage",
//         newVariantData,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (data.success) {
//         toast.success(data.message);
//         setIsAdding(false);
//         setNewVariantData({
//           productId: "",
//           color: "",
//           storage: "",
//           price: "",
//           offerPrice: "",
//           stock: "",
//           sku: "",
//           image: "",
//         });
//         setSelectedCategory("");
//         setProducts([]);
//         fetchSellerVariants();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || error.message);
//     }
//   };

//   const handleEditVariant = (variant) => {
//     setEditingVariant(variant._id);
//     setEditVariantData({
//       productId: variant.productId || "",
//       color: variant.color || "",
//       storage: variant.storage || "",
//       price: variant.price || "",
//       offerPrice: variant.offerPrice || "",
//       stock: variant.stock || "",
//       sku: variant.sku || "",
//       image: variant.image || "",
//     });
//   };

//   const handleUpdateVariant = async (e) => {
//     e.preventDefault();
//     try {
//       const token = await getToken();
//       console.log("Sending update data:", editVariantData);
//       const { data } = await axios.put(
//         "/api/variants/manage",
//         editVariantData,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (data.success) {
//         toast.success(data.message);
//         setEditingVariant(null);
//         fetchSellerVariants();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || error.message);
//     }
//   };

//   const handleDeleteVariant = async (variantId) => {
//     if (confirm("Bạn có chắc chắn muốn xóa biến thể này?")) {
//       try {
//         const token = await getToken();
//         const { data } = await axios.delete("/api/variants/manage", {
//           headers: { Authorization: `Bearer ${token}` },
//           data: { variantId },
//         });

//         if (data.success) {
//           toast.success(data.message);
//           fetchSellerVariants();
//         } else {
//           toast.error(data.message);
//         }
//       } catch (error) {
//         toast.error(error.response?.data?.message || error.message);
//       }
//     }
//   };

//   const handleCancelAdd = () => {
//     setIsAdding(false);
//     setNewVariantData({
//       productId: "",
//       color: "",
//       storage: "",
//       price: "",
//       offerPrice: "",
//       stock: "",
//       sku: "",
//       image: "",
//     });
//     setSelectedCategory("");
//     setProducts([]);
//   };

//   const handleCancelEdit = () => {
//     setEditingVariant(null);
//     setEditVariantData({
//       productId: "",
//       color: "",
//       storage: "",
//       price: "",
//       offerPrice: "",
//       stock: "",
//       sku: "",
//       image: "",
//     });
//   };

//   useEffect(() => {
//     if (isLoaded) {
//       fetchSellerVariants();
//       fetchCategories();
//     }
//   }, [isLoaded]);

//   useEffect(() => {
//     if (selectedCategory) {
//       fetchProductsByCategory(selectedCategory);
//     } else {
//       setProducts([]);
//     }
//   }, [selectedCategory]);

//   const formatCurrency = (value) =>
//     new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(value);

//   return (
//     <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
//       {loading ? (
//         <Loading />
//       ) : (
//         <div className="md:p-10 p-4 space-y-5">
//           <div className="flex justify-between items-center">
//             <h2 className="text-lg font-medium">Quản Lý Biến Thể</h2>
//             <button
//               onClick={() => setIsAdding(true)}
//               className="px-4 py-2 bg-green-600 text-white rounded-md"
//             >
//               Thêm Biến Thể Mới
//             </button>
//           </div>

//           {/* Form thêm biến thể mới */}
//           {isAdding && (
//             <div className="mt-6 max-w-lg">
//               <h2 className="text-lg font-medium mb-4">Thêm Biến Thể</h2>
//               <form onSubmit={handleAddVariant} className="space-y-5">
//                 <div className="flex flex-col gap-1">
//                   <label
//                     className="text-base font-medium"
//                     htmlFor="new-category"
//                   >
//                     Chọn Danh Mục
//                   </label>
//                   <select
//                     id="new-category"
//                     className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                     onChange={(e) => setSelectedCategory(e.target.value)}
//                     value={selectedCategory}
//                     required
//                   >
//                     <option value="">Chọn danh mục</option>
//                     {categories.map((category) => (
//                       <option key={category._id} value={category._id}>
//                         {category.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <label
//                     className="text-base font-medium"
//                     htmlFor="new-product"
//                   >
//                     Chọn Sản Phẩm
//                   </label>
//                   <select
//                     id="new-product"
//                     className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                     onChange={(e) =>
//                       setNewVariantData({
//                         ...newVariantData,
//                         productId: e.target.value,
//                       })
//                     }
//                     value={newVariantData.productId}
//                     required
//                     disabled={!selectedCategory}
//                   >
//                     <option value="">Chọn sản phẩm</option>
//                     {products.map((product) => (
//                       <option key={product._id} value={product._id}>
//                         {product.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <label className="text-base font-medium" htmlFor="new-color">
//                     Màu Sắc
//                   </label>
//                   <input
//                     id="new-color"
//                     type="text"
//                     placeholder="Nhập màu sắc"
//                     className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                     onChange={(e) =>
//                       setNewVariantData({
//                         ...newVariantData,
//                         color: e.target.value,
//                       })
//                     }
//                     value={newVariantData.color}
//                     required
//                   />
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <label
//                     className="text-base font-medium"
//                     htmlFor="new-storage"
//                   >
//                     Dung Lượng
//                   </label>
//                   <input
//                     id="new-storage"
//                     type="text"
//                     placeholder="Nhập dung lượng"
//                     className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                     onChange={(e) =>
//                       setNewVariantData({
//                         ...newVariantData,
//                         storage: e.target.value,
//                       })
//                     }
//                     value={newVariantData.storage}
//                     required
//                   />
//                 </div>
//                 <div className="flex items-center gap-5 flex-wrap">
//                   <div className="flex flex-col gap-1 w-32">
//                     <label
//                       className="text-base font-medium"
//                       htmlFor="new-price"
//                     >
//                       Giá Gốc
//                     </label>
//                     <input
//                       id="new-price"
//                       type="number"
//                       placeholder="0"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setNewVariantData({
//                           ...newVariantData,
//                           price: e.target.value,
//                         })
//                       }
//                       value={newVariantData.price}
//                       required
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1 w-32">
//                     <label
//                       className="text-base font-medium"
//                       htmlFor="new-offerPrice"
//                     >
//                       Giá Khuyến Mãi
//                     </label>
//                     <input
//                       id="new-offerPrice"
//                       type="number"
//                       placeholder="0"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setNewVariantData({
//                           ...newVariantData,
//                           offerPrice: e.target.value,
//                         })
//                       }
//                       value={newVariantData.offerPrice}
//                       required
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1 w-32">
//                     <label
//                       className="text-base font-medium"
//                       htmlFor="new-stock"
//                     >
//                       Số Lượng
//                     </label>
//                     <input
//                       id="new-stock"
//                       type="number"
//                       placeholder="0"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setNewVariantData({
//                           ...newVariantData,
//                           stock: e.target.value,
//                         })
//                       }
//                       value={newVariantData.stock}
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1 w-32">
//                     <label className="text-base font-medium" htmlFor="new-sku">
//                       SKU
//                     </label>
//                     <input
//                       id="new-sku"
//                       type="text"
//                       placeholder="Nhập SKU"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setNewVariantData({
//                           ...newVariantData,
//                           sku: e.target.value,
//                         })
//                       }
//                       value={newVariantData.sku}
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1 w-32">
//                     <label
//                       className="text-base font-medium"
//                       htmlFor="new-image"
//                     >
//                       URL Hình Ảnh
//                     </label>
//                     <input
//                       id="new-image"
//                       type="text"
//                       placeholder="Nhập URL ảnh"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setNewVariantData({
//                           ...newVariantData,
//                           image: e.target.value,
//                         })
//                       }
//                       value={newVariantData.image}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex gap-3">
//                   <button
//                     type="submit"
//                     className="px-8 py-2.5 bg-green-600 text-white font-medium rounded"
//                   >
//                     THÊM
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handleCancelAdd}
//                     className="px-8 py-2.5 bg-gray-500 text-white font-medium rounded"
//                   >
//                     HỦY
//                   </button>
//                 </div>
//               </form>
//             </div>
//           )}

//           {/* Form chỉnh sửa biến thể */}
//           {editingVariant && (
//             <div className="mt-6 max-w-lg">
//               <h2 className="text-lg font-medium mb-4">Chỉnh Sửa Biến Thể</h2>
//               <form onSubmit={handleUpdateVariant} className="space-y-5">
//                 <div className="flex flex-col gap-1">
//                   <label
//                     className="text-base font-medium"
//                     htmlFor="edit-productId"
//                   >
//                     ID Sản Phẩm
//                   </label>
//                   <input
//                     id="edit-productId"
//                     type="text"
//                     placeholder="Nhập ID sản phẩm"
//                     className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                     onChange={(e) =>
//                       setEditVariantData({
//                         ...editVariantData,
//                         productId: e.target.value,
//                       })
//                     }
//                     value={editVariantData.productId}
//                     required
//                     disabled
//                   />
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <label className="text-base font-medium" htmlFor="edit-color">
//                     Màu Sắc
//                   </label>
//                   <input
//                     id="edit-color"
//                     type="text"
//                     placeholder="Nhập màu sắc"
//                     className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                     onChange={(e) =>
//                       setEditVariantData({
//                         ...editVariantData,
//                         color: e.target.value,
//                       })
//                     }
//                     value={editVariantData.color}
//                     required
//                   />
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <label
//                     className="text-base font-medium"
//                     htmlFor="edit-storage"
//                   >
//                     Dung Lượng
//                   </label>
//                   <input
//                     id="edit-storage"
//                     type="text"
//                     placeholder="Nhập dung lượng"
//                     className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                     onChange={(e) =>
//                       setEditVariantData({
//                         ...editVariantData,
//                         storage: e.target.value,
//                       })
//                     }
//                     value={editVariantData.storage}
//                     required
//                   />
//                 </div>
//                 <div className="flex items-center gap-5 flex-wrap">
//                   <div className="flex flex-col gap-1 w-32">
//                     <label
//                       className="text-base font-medium"
//                       htmlFor="edit-price"
//                     >
//                       Giá Gốc
//                     </label>
//                     <input
//                       id="edit-price"
//                       type="number"
//                       placeholder="0"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setEditVariantData({
//                           ...editVariantData,
//                           price: e.target.value,
//                         })
//                       }
//                       value={editVariantData.price}
//                       required
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1 w-32">
//                     <label
//                       className="text-base font-medium"
//                       htmlFor="edit-offerPrice"
//                     >
//                       Giá Khuyến Mãi
//                     </label>
//                     <input
//                       id="edit-offerPrice"
//                       type="number"
//                       placeholder="0"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setEditVariantData({
//                           ...editVariantData,
//                           offerPrice: e.target.value,
//                         })
//                       }
//                       value={editVariantData.offerPrice}
//                       required
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1 w-32">
//                     <label
//                       className="text-base font-medium"
//                       htmlFor="edit-stock"
//                     >
//                       Số Lượng
//                     </label>
//                     <input
//                       id="edit-stock"
//                       type="number"
//                       placeholder="0"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setEditVariantData({
//                           ...editVariantData,
//                           stock: e.target.value,
//                         })
//                       }
//                       value={editVariantData.stock}
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1 w-32">
//                     <label className="text-base font-medium" htmlFor="edit-sku">
//                       SKU
//                     </label>
//                     <input
//                       id="edit-sku"
//                       type="text"
//                       placeholder="Nhập SKU"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setEditVariantData({
//                           ...editVariantData,
//                           sku: e.target.value,
//                         })
//                       }
//                       value={editVariantData.sku}
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1 w-32">
//                     <label
//                       className="text-base font-medium"
//                       htmlFor="edit-image"
//                     >
//                       URL Hình Ảnh
//                     </label>
//                     <input
//                       id="edit-image"
//                       type="text"
//                       placeholder="Nhập URL ảnh"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setEditVariantData({
//                           ...editVariantData,
//                           image: e.target.value,
//                         })
//                       }
//                       value={editVariantData.image}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex gap-3">
//                   <button
//                     type="submit"
//                     className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded"
//                   >
//                     CẬP NHẬT
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handleCancelEdit}
//                     className="px-8 py-2.5 bg-gray-500 text-white font-medium rounded"
//                   >
//                     HỦY
//                   </button>
//                 </div>
//               </form>
//             </div>
//           )}

//           <div className="max-w-4xl rounded-md">
//             {variants.length === 0 ? (
//               <p className="text-gray-500">Không tìm thấy biến thể nào</p>
//             ) : (
//               variants.map((variant) => (
//                 <div
//                   key={variant._id}
//                   className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300"
//                 >
//                   <div className="flex-1 flex gap-5 max-w-80">
//                     {assets.product_icon && (
//                       <Image
//                         className="max-w-16 max-h-16 object-cover"
//                         src={variant.image || assets.placeholder_image}
//                         alt="product_icon"
//                       />
//                     )}
//                     <p className="flex flex-col gap-3">
//                       <span className="font-medium">
//                         {variant.color}/{variant.storage}
//                       </span>
//                       <span>SKU: {variant.sku || "N/A"}</span>
//                     </p>
//                   </div>
//                   <div>
//                     <p className="font-medium my-auto">
//                       Giá: {formatCurrency(variant.offerPrice)}{" "}
//                       <span className="text-gray-500 line-through">
//                         {formatCurrency(variant.price)}
//                       </span>
//                     </p>
//                   </div>
//                   <div className="flex flex-col gap-3">
//                     <p className="flex flex-col">
//                       <span>Số lượng: {variant.stock || 0}</span>
//                     </p>
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleEditVariant(variant)}
//                         className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
//                       >
//                         Sửa
//                       </button>
//                       <button
//                         onClick={() => handleDeleteVariant(variant._id)}
//                         className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md text-sm"
//                       >
//                         Xóa
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//       {/* <Footer /> */}
//     </div>
//   );
// };

// export default Variants;
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { assets } from "@/assets/assets";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";

const Variants = () => {
  const { getToken, isLoaded, userId } = useAuth(); // Lấy userId từ Clerk
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [attributeRefs, setAttributeRefs] = useState([]);
  const [newVariantData, setNewVariantData] = useState({
    productId: "",
    attributeRefs: [],
    price: 0,
    offerPrice: 0,
    stock: "",
    sku: "",
    image: "",
  });
  const [editVariantData, setEditVariantData] = useState({
    productId: "",
    attributeRefs: [],
    price: 0,
    offerPrice: 0,
    stock: "",
    sku: "",
    image: "",
  });

  const fetchSellerVariants = async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Không lấy được token. Hãy đăng nhập lại.");
        return;
      }
      const { data } = await axios.get("/api/variants/manage", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        console.log("Fetched Variants:", data.variants);
        setVariants(data.variants || []);
      } else {
        toast.error(data.message || "Không thể tải biến thể");
      }
    } catch (error) {
      console.error("Lỗi khi lấy biến thể:", error);
      toast.error("Lỗi server. Vui lòng thử lại sau: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/category/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setCategories(data.categories || []);
      } else {
        toast.error(data.message || "Không thể tải danh mục");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
      toast.error("Lỗi server. Vui lòng thử lại sau.");
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`/api/product?category=${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setProducts(data.products || []);
      } else {
        toast.error(data.message || "Không thể tải sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      toast.error("Lỗi server. Vui lòng thử lại sau.");
    }
  };

  const fetchAttributes = async () => {
    try {
      const token = await getToken();
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
    }
  };

  const handleAddAttributeRef = (attributeId, value) => {
    setAttributeRefs((prev) => {
      const updatedRefs = prev.filter((ref) => ref.attributeId !== attributeId);
      if (value) {
        return [...updatedRefs, { attributeId, value }];
      }
      return updatedRefs;
    });
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      if (!selectedProduct) throw new Error("Vui lòng chọn sản phẩm");

      const productResponse = await axios.get(
        `/api/product/${selectedProduct}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const product = productResponse.data.product;
      if (!product) throw new Error("Sản phẩm không tồn tại");

      const variantData = {
        ...newVariantData,
        productId: selectedProduct,
        attributeRefs,
        price: newVariantData.price || product.price || 0,
        offerPrice: newVariantData.offerPrice || product.offerPrice || 0,
        userId: userId, // Sử dụng userId từ Clerk
      };
      console.log("Sending Variant Data:", variantData);
      const { data } = await axios.post("/api/variants/manage", variantData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(data.message);
        setIsAdding(false);
        setNewVariantData({
          productId: "",
          attributeRefs: [],
          price: 0,
          offerPrice: 0,
          stock: "",
          sku: "",
          image: "",
        });
        setSelectedCategory("");
        setSelectedProduct("");
        setAttributeRefs([]);
        fetchSellerVariants();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(
        "Add Variant Error:",
        error.response?.data || error.message,
        error.stack
      );
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant._id);
    setEditVariantData({
      productId: variant.productId,
      attributeRefs: variant.attributeRefs || [],
      price: variant.price || 0,
      offerPrice: variant.offerPrice || 0,
      stock: variant.stock || "",
      sku: variant.sku || "",
      image: variant.image || "",
    });
    setAttributeRefs(variant.attributeRefs || []);
  };

  const handleUpdateVariant = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const variantData = {
        ...editVariantData,
        attributeRefs,
      };
      console.log("Updating Variant Data:", variantData);
      const { data } = await axios.put("/api/variants/manage", variantData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(data.message);
        setEditingVariant(null);
        fetchSellerVariants();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(
        "Update Variant Error:",
        error.response?.data || error.message,
        error.stack
      );
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (confirm("Bạn có chắc chắn muốn xóa biến thể này?")) {
      try {
        const token = await getToken();
        console.log("Deleting Variant ID:", variantId);
        const { data } = await axios.delete("/api/variants/manage", {
          headers: { Authorization: `Bearer ${token}` },
          data: { variantId },
        });
        if (data.success) {
          toast.success(data.message);
          fetchSellerVariants();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error(
          "Delete Variant Error:",
          error.response?.data || error.message,
          error.stack
        );
        toast.error(
          error.response?.data?.message ||
            "Lỗi khi xóa biến thể: " + error.message
        );
      }
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewVariantData({
      productId: "",
      attributeRefs: [],
      price: 0,
      offerPrice: 0,
      stock: "",
      sku: "",
      image: "",
    });
    setSelectedCategory("");
    setSelectedProduct("");
    setAttributeRefs([]);
  };

  const handleCancelEdit = () => {
    setEditingVariant(null);
    setEditVariantData({
      productId: "",
      attributeRefs: [],
      price: 0,
      offerPrice: 0,
      stock: "",
      sku: "",
      image: "",
    });
    setAttributeRefs([]);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  useEffect(() => {
    if (isLoaded) {
      fetchSellerVariants();
      fetchCategories();
      fetchAttributes();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else {
      setProducts([]);
    }
  }, [selectedCategory]);

  return (
    <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
      {loading ? (
        <Loading />
      ) : (
        <div className="md:p-10 p-4 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Quản Lý Biến Thể</h2>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Thêm Biến Thể Mới
            </button>
          </div>

          {isAdding && (
            <div className="mt-6 max-w-lg">
              <h2 className="text-lg font-medium mb-4">Thêm Biến Thể</h2>
              <form onSubmit={handleAddVariant} className="space-y-5">
                <div className="flex flex-col gap-1">
                  <label
                    className="text-base font-medium"
                    htmlFor="new-category"
                  >
                    Chọn Danh Mục
                  </label>
                  <select
                    id="new-category"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    value={selectedCategory}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    className="text-base font-medium"
                    htmlFor="new-product"
                  >
                    Chọn Sản Phẩm
                  </label>
                  <select
                    id="new-product"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    value={selectedProduct}
                    required
                    disabled={!selectedCategory}
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium">
                    Thuộc Tính (Màu Sắc/Dung Lượng)
                  </label>
                  {attributes.map((attr) => (
                    <div key={attr._id} className="mb-2">
                      <select
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 w-full"
                        onChange={(e) =>
                          handleAddAttributeRef(attr._id, e.target.value)
                        }
                        value={
                          attributeRefs.find(
                            (ref) => ref.attributeId.toString() === attr._id
                          )?.value || ""
                        }
                      >
                        <option value="">Chọn {attr.name}</option>
                        {attr.values.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="new-price">
                    Giá Gốc
                  </label>
                  <input
                    id="new-price"
                    type="number"
                    placeholder="Nhập giá gốc"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    value={newVariantData.price}
                    onChange={(e) =>
                      setNewVariantData({
                        ...newVariantData,
                        price: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    className="text-base font-medium"
                    htmlFor="new-offerPrice"
                  >
                    Giá Khuyến Mãi
                  </label>
                  <input
                    id="new-offerPrice"
                    type="number"
                    placeholder="Nhập giá khuyến mãi (không bắt buộc)"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    value={newVariantData.offerPrice}
                    onChange={(e) =>
                      setNewVariantData({
                        ...newVariantData,
                        offerPrice: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="new-stock">
                    Số Lượng
                  </label>
                  <input
                    id="new-stock"
                    type="number"
                    placeholder="Nhập số lượng"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    value={newVariantData.stock}
                    onChange={(e) =>
                      setNewVariantData({
                        ...newVariantData,
                        stock: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="new-sku">
                    SKU
                  </label>
                  <input
                    id="new-sku"
                    type="text"
                    placeholder="Nhập SKU"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    value={newVariantData.sku}
                    onChange={(e) =>
                      setNewVariantData({
                        ...newVariantData,
                        sku: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="new-image">
                    URL Hình Ảnh
                  </label>
                  <input
                    id="new-image"
                    type="text"
                    placeholder="Nhập URL ảnh"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    value={newVariantData.image}
                    onChange={(e) =>
                      setNewVariantData({
                        ...newVariantData,
                        image: e.target.value,
                      })
                    }
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
                    onClick={handleCancelAdd}
                    className="px-8 py-2.5 bg-gray-500 text-white font-medium rounded"
                  >
                    HỦY
                  </button>
                </div>
              </form>
            </div>
          )}

          {editingVariant && (
            <div className="mt-6 max-w-lg">
              <h2 className="text-lg font-medium mb-4">Chỉnh Sửa Biến Thể</h2>
              <form onSubmit={handleUpdateVariant} className="space-y-5">
                <div className="flex flex-col gap-1">
                  <label
                    className="text-base font-medium"
                    htmlFor="edit-productId"
                  >
                    ID Sản Phẩm
                  </label>
                  <input
                    id="edit-productId"
                    type="text"
                    placeholder="Nhập ID sản phẩm"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    value={editVariantData.productId}
                    disabled
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium">
                    Thuộc Tính (Màu Sắc/Dung Lượng)
                  </label>
                  {attributes.map((attr) => (
                    <div key={attr._id} className="mb-2">
                      <select
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 w-full"
                        onChange={(e) =>
                          handleAddAttributeRef(attr._id, e.target.value)
                        }
                        value={
                          attributeRefs.find(
                            (ref) => ref.attributeId.toString() === attr._id
                          )?.value || ""
                        }
                      >
                        <option value="">Chọn {attr.name}</option>
                        {attr.values.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-price"
                    >
                      Giá Gốc
                    </label>
                    <input
                      id="edit-price"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      value={editVariantData.price}
                      onChange={(e) =>
                        setEditVariantData({
                          ...editVariantData,
                          price: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-offerPrice"
                    >
                      Giá Khuyến Mãi
                    </label>
                    <input
                      id="edit-offerPrice"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      value={editVariantData.offerPrice}
                      onChange={(e) =>
                        setEditVariantData({
                          ...editVariantData,
                          offerPrice: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-stock"
                    >
                      Số Lượng
                    </label>
                    <input
                      id="edit-stock"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      value={editVariantData.stock}
                      onChange={(e) =>
                        setEditVariantData({
                          ...editVariantData,
                          stock: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label className="text-base font-medium" htmlFor="edit-sku">
                      SKU
                    </label>
                    <input
                      id="edit-sku"
                      type="text"
                      placeholder="Nhập SKU"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      value={editVariantData.sku}
                      onChange={(e) =>
                        setEditVariantData({
                          ...editVariantData,
                          sku: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-image"
                    >
                      URL Hình Ảnh
                    </label>
                    <input
                      id="edit-image"
                      type="text"
                      placeholder="Nhập URL ảnh"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      value={editVariantData.image}
                      onChange={(e) =>
                        setEditVariantData({
                          ...editVariantData,
                          image: e.target.value,
                        })
                      }
                    />
                  </div>
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
                    onClick={handleCancelEdit}
                    className="px-8 py-2.5 bg-gray-500 text-white font-medium rounded"
                  >
                    HỦY
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="max-w-4xl rounded-md">
            {variants.length === 0 ? (
              <p className="text-gray-500">Không tìm thấy biến thể nào</p>
            ) : (
              variants.map((variant) => (
                <div
                  key={variant._id}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300"
                >
                  <div className="flex-1 flex gap-5 max-w-80">
                    {assets.product_icon && (
                      <Image
                        className="max-w-16 max-h-16 object-cover"
                        src={variant.image || assets.placeholder_image}
                        alt="product_icon"
                      />
                    )}
                    <p className="flex flex-col gap-3">
                      <span className="font-medium">
                        {variant.productId?.name || "Sản phẩm không xác định"} -{" "}
                        {variant.attributeRefs
                          .map((ref) => ref.value)
                          .join("/")}
                      </span>
                      <span>SKU: {variant.sku || "N/A"}</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-medium my-auto">
                      Giá: {formatCurrency(variant.price)}
                      {variant.offerPrice &&
                        variant.offerPrice < variant.price && (
                          <span className="text-red-500 ml-2">
                            Khuyến mãi: {formatCurrency(variant.offerPrice)}
                          </span>
                        )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="flex flex-col">
                      <span>Số lượng: {variant.stock || 0}</span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditVariant(variant)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteVariant(variant._id)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* <Footer /> */}
    </div>
  );
};

export default Variants;
