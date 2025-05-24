// "use client";
// import React, { useEffect, useState } from "react";
// import { assets } from "@/assets/assets";
// import Image from "next/image";
// import { useAppContext } from "@/context/AppContext";
// import Footer from "@/components/seller/Footer";
// import Loading from "@/components/Loading";
// import axios from "axios";
// import toast from "react-hot-toast";

// const ProductList = () => {
//   const { router, getToken, user, deleteProduct, formatCurrency } =
//     useAppContext();

//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     category: "",
//     price: "",
//     offerPrice: "",
//     stock: "",
//     brand: "",
//   });

//   const fetchSellerProduct = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get("/api/product/seller-list", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       console.log("API Response:", data);

//       if (data.success) {
//         setProducts(data.product || []);
//         setLoading(false);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error("Fetch Product Error:", error);
//       toast.error(error.message);
//     }
//   };

//   const handleDeleteProduct = async (productId) => {
//     if (confirm("Are you sure you to delete this product?")) {
//       await deleteProduct(productId);
//       fetchSellerProduct();
//     }
//   };

//   const handleEditProduct = (product) => {
//     if (!product._id) {
//       toast.error("Product ID is missing");
//       return;
//     }
//     setEditingProduct(product._id);
//     setFormData({
//       name: product.name || "",
//       description: product.description || "",
//       category: product.category || "Earphone",
//       price: product.price !== undefined ? product.price : "",
//       offerPrice: product.offerPrice !== undefined ? product.offerPrice : "",
//       stock: product.stock !== undefined ? product.stock : "0",
//       brand: product.brand || "Unknown",
//     });
//   };

//   const handleUpdateProduct = async (e) => {
//     e.preventDefault();
//     if (!editingProduct) {
//       toast.error("No product selected for update");
//       return;
//     }
//     try {
//       const token = await getToken();
//       const { data } = await axios.put(
//         `/api/product/update/${editingProduct}`,
//         formData,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (data.success) {
//         toast.success(data.message);
//         setEditingProduct(null);
//         fetchSellerProduct();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error("Update Product Error:", error);
//       toast.error(error.response?.data?.message || error.message);
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditingProduct(null);
//     setFormData({
//       name: "",
//       description: "",
//       category: "",
//       price: "",
//       offerPrice: "",
//       stock: "",
//       brand: "",
//     });
//   };

//   useEffect(() => {
//     if (user && getToken) {
//       fetchSellerProduct();
//     }
//   }, [user, getToken]);

//   return (
//     <div className="flex-1 min-h-screen flex flex-col justify-between">
//       {loading ? (
//         <Loading />
//       ) : (
//         <div className="w-full md:p-10 p-4">
//           <h2 className="pb-4 text-lg font-medium">Tất Cả Sản Phẩm</h2>
//           <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
//             {/* Table layout for larger screens (sm and above) */}
//             <div className="hidden sm:block w-full">
//               <table className="table-fixed w-full overflow-hidden">
//                 <thead className="text-gray-900 text-sm text-left">
//                   <tr>
//                     <th className="w-2/5 px-4 py-3 font-medium truncate">
//                       Sản Phẩm
//                     </th>
//                     <th className="w-24 px-4 py-3 font-medium truncate">
//                       Loại
//                     </th>
//                     <th className="w-24 px-4 py-3 font-medium truncate">
//                       Hãng
//                     </th>
//                     <th className="w-24 px-4 py-3 font-medium truncate">
//                       Số Lượng
//                     </th>
//                     <th className="w-28 px-4 py-3 font-medium truncate">
//                       Giá tiền
//                     </th>
//                     <th className="w-48 px-4 py-3 font-medium">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-sm text-gray-500">
//                   {products && products.length > 0 ? (
//                     products.map((product, index) => (
//                       <tr key={index} className="border-t border-gray-500/20">
//                         <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
//                           <div className="bg-gray-500/10 rounded p-2">
//                             <Image
//                               src={
//                                 product.image?.[0] || assets.placeholder_image
//                               }
//                               alt="Product Image"
//                               className="w-16"
//                               width={1280}
//                               height={720}
//                             />
//                           </div>
//                           <span className="truncate w-full">
//                             {product.name}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">{product.category}</td>
//                         <td className="px-4 py-3">
//                           {product.brand || "Unknown"}
//                         </td>
//                         <td className="px-4 py-3">
//                           {product.stock !== undefined ? product.stock : "0"}
//                         </td>
//                         <td className="px-4 py-3">
//                           {formatCurrency(product.offerPrice)}
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => {
//                                 if (product._id) {
//                                   router.push(`/product/${product._id}`);
//                                 } else {
//                                   console.error(
//                                     "Error: product._id is undefined",
//                                     product
//                                   );
//                                   toast.error("Product ID not found!");
//                                 }
//                               }}
//                               className="flex items-center gap-1 px-2 py-1 bg-orange-600 text-white rounded-md text-sm"
//                             >
//                               <span>Xem</span>
//                               <Image
//                                 className="h-3.5"
//                                 src={assets.redirect_icon}
//                                 alt="redirect_icon"
//                               />
//                             </button>
//                             <button
//                               onClick={() => handleEditProduct(product)}
//                               className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
//                             >
//                               <span>Sửa</span>
//                             </button>
//                             <button
//                               onClick={() => handleDeleteProduct(product._id)}
//                               className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md text-sm"
//                             >
//                               <span>Xóa</span>
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="6" className="text-center py-5">
//                         Không Tìm Thấy Sản Phẩm
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Card layout for smaller screens (below sm) */}
//             <div className="block sm:hidden w-full">
//               {products && products.length > 0 ? (
//                 products.map((product, index) => (
//                   <div
//                     key={index}
//                     className="border-b border-gray-500/20 p-4 flex flex-col gap-2"
//                   >
//                     <div className="flex items-center space-x-3">
//                       <div className="bg-gray-500/10 rounded p-2">
//                         <Image
//                           src={product.image?.[0] || assets.placeholder_image}
//                           alt="Product Image"
//                           className="w-16"
//                           width={1280}
//                           height={720}
//                         />
//                       </div>
//                       <span className="truncate text-sm font-medium">
//                         {product.name}
//                       </span>
//                     </div>
//                     <div className="flex flex-col gap-1 text-sm text-gray-500">
//                       <div>
//                         <span className="font-medium">Loại: </span>
//                         {product.category}
//                       </div>
//                       <div>
//                         <span className="font-medium">Hãng: </span>
//                         {product.brand || "Unknown"}
//                       </div>
//                       <div>
//                         <span className="font-medium">Số Lượng: </span>
//                         {product.stock !== undefined ? product.stock : "0"}
//                       </div>
//                       <div>
//                         <span className="font-medium">Giá tiền: </span>
//                         {formatCurrency(product.offerPrice)}
//                       </div>
//                     </div>
//                     <div className="flex gap-2 mt-2">
//                       <button
//                         onClick={() => {
//                           if (product._id) {
//                             router.push(`/product/${product._id}`);
//                           } else {
//                             console.error(
//                               "Error: product._id is undefined",
//                               product
//                             );
//                             toast.error("Product ID not found!");
//                           }
//                         }}
//                         className="flex items-center gap-1 px-2 py-1 bg-orange-600 text-white rounded-md text-sm"
//                       >
//                         <span>Xem</span>
//                         <Image
//                           className="h-3.5"
//                           src={assets.redirect_icon}
//                           alt="redirect_icon"
//                         />
//                       </button>
//                       <button
//                         onClick={() => handleEditProduct(product)}
//                         className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
//                       >
//                         <span>Sửa</span>
//                       </button>
//                       <button
//                         onClick={() => handleDeleteProduct(product._id)}
//                         className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md text-sm"
//                       >
//                         <span>Xóa</span>
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-5 text-sm text-gray-500">
//                   Không Tìm Thấy Sản Phẩm
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Form chỉnh sửa sản phẩm */}
//           {editingProduct && (
//             <div className="mt-6 max-w-lg">
//               <h2 className="text-lg font-medium mb-4">Chỉnh Sửa Sản Phẩm</h2>
//               <form onSubmit={handleUpdateProduct} className="space-y-5">
//                 <div className="flex flex-col gap-1">
//                   <label className="text-base font-medium" htmlFor="edit-name">
//                     Tên Sản Phẩm
//                   </label>
//                   <input
//                     id="edit-name"
//                     type="text"
//                     placeholder="Type here"
//                     className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                     onChange={(e) =>
//                       setFormData({ ...formData, name: e.target.value })
//                     }
//                     value={formData.name || ""}
//                     required
//                   />
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <label
//                     className="text-base font-medium"
//                     htmlFor="edit-description"
//                   >
//                     Chi Tiết Sản Phẩm
//                   </label>
//                   <textarea
//                     id="edit-description"
//                     rows={4}
//                     className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
//                     placeholder="Type here"
//                     onChange={(e) =>
//                       setFormData({ ...formData, description: e.target.value })
//                     }
//                     value={formData.description || ""}
//                     required
//                   />
//                 </div>
//                 <div className="flex items-center gap-5 flex-wrap">
//                   <div className="flex flex-col gap-1 w-32">
//                     <label
//                       className="text-base font-medium"
//                       htmlFor="edit-category"
//                     >
//                       Loại
//                     </label>
//                     <select
//                       id="edit-category"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setFormData({ ...formData, category: e.target.value })
//                       }
//                       value={formData.category || "Earphone"}
//                     >
//                       <option value="Earphone">Earphone</option>
//                       <option value="Headphone">Headphone</option>
//                       <option value="Watch">Watch</option>
//                       <option value="Smartphone">Smartphone</option>
//                       <option value="Laptop">Laptop</option>
//                       <option value="Camera">Camera</option>
//                       <option value="Accessories">Accessories</option>
//                     </select>
//                   </div>
//                   <div className="flex flex-col gap-1 w-32">
//                     <label
//                       className="text-base font-medium"
//                       htmlFor="edit-price"
//                     >
//                       Giá Sản Phẩm
//                     </label>
//                     <input
//                       id="edit-price"
//                       type="number"
//                       placeholder="0"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setFormData({ ...formData, price: e.target.value })
//                       }
//                       value={formData.price !== undefined ? formData.price : ""}
//                       required
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1 w-32">
//                     <label
//                       className="text-base font-medium"
//                       htmlFor="edit-offer-price"
//                     >
//                       Giá Ưu Đãi
//                     </label>
//                     <input
//                       id="edit-offer-price"
//                       type="number"
//                       placeholder="0"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setFormData({ ...formData, offerPrice: e.target.value })
//                       }
//                       value={
//                         formData.offerPrice !== undefined
//                           ? formData.offerPrice
//                           : ""
//                       }
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
//                         setFormData({ ...formData, stock: e.target.value })
//                       }
//                       value={
//                         formData.stock !== undefined ? formData.stock : "0"
//                       }
//                       required
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1 w-32">
//                     <label
//                       className="text-base font-medium"
//                       htmlFor="edit-brand"
//                     >
//                       Hãng
//                     </label>
//                     <input
//                       id="edit-brand"
//                       type="text"
//                       placeholder="Type here"
//                       className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
//                       onChange={(e) =>
//                         setFormData({ ...formData, brand: e.target.value })
//                       }
//                       value={formData.brand || ""}
//                       required
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
//         </div>
//       )}
//       {/* <Footer /> */}
//     </div>
//   );
// };

// export default ProductList;
"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const ProductList = () => {
  const { router, getToken, user, deleteProduct, formatCurrency } =
    useAppContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]); // Danh sách categories từ API
  const [brands, setBrands] = useState([]); // Danh sách brands từ API
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryName: "", // Đổi thành categoryName để khớp với API
    price: "",
    offerPrice: "",
    stock: "",
    brandName: "", // Đổi thành brandName để khớp với API
  });

  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/product/seller-list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", data); // Kiểm tra dữ liệu trả về

      if (data.success) {
        setProducts(data.product || []);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch Product Error:", error);
      toast.error(error.message);
    }
  };

  const fetchCategoriesAndBrands = async () => {
    try {
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

      if (catRes.data.success) {
        setCategories(catRes.data.items);
      }
      if (brandRes.data.success) {
        setBrands(brandRes.data.items);
      }
    } catch (error) {
      console.error("Fetch Categories/Brands Error:", error.response?.data);
      toast.error(
        "Lỗi khi tải danh sách loại và hãng: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(productId);
      fetchSellerProduct();
    }
  };

  const handleEditProduct = (product) => {
    if (!product._id) {
      toast.error("Product ID is missing");
      return;
    }
    setEditingProduct(product._id);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      categoryName: product.category?.name || "", // Đổi thành categoryName
      price: product.price !== undefined ? product.price : "",
      offerPrice: product.offerPrice !== undefined ? product.offerPrice : "",
      stock: product.stock !== undefined ? product.stock : "0",
      brandName: product.brand?.name || "Unknown", // Đổi thành brandName
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) {
      toast.error("No product selected for update");
      return;
    }
    try {
      const token = await getToken();
      console.log("Sending data to:", `/api/product/update/${editingProduct}`);
      console.log("Form data:", formData);

      const updatedData = {
        name: formData.name,
        description: formData.description,
        category: formData.categoryName,
        price: formData.price || "0",
        offerPrice: formData.offerPrice || "0",
        stock: formData.stock || "0",
        brand: formData.brandName,
      };
      console.log("Updated data sent:", updatedData); // Log để kiểm tra

      const response = await axios.put(
        `/api/product/update/${editingProduct}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      if (response.data.success) {
        toast.success(response.data.message);
        setEditingProduct(null);
        fetchSellerProduct();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(
        "Update Product Error:",
        error.response?.status,
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      categoryName: "",
      price: "",
      offerPrice: "",
      stock: "",
      brandName: "",
    });
  };

  useEffect(() => {
    if (user && getToken) {
      fetchSellerProduct();
      fetchCategoriesAndBrands();
    }
  }, [user, getToken]);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">Tất Cả Sản Phẩm</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            {/* Table layout for larger screens (sm and above) */}
            <div className="hidden sm:block w-full">
              <table className="table-fixed w-full overflow-hidden">
                <thead className="text-gray-900 text-sm text-left">
                  <tr>
                    <th className="w-2/5 px-4 py-3 font-medium truncate">
                      Sản Phẩm
                    </th>
                    <th className="w-24 px-4 py-3 font-medium truncate">
                      Loại
                    </th>
                    <th className="w-24 px-4 py-3 font-medium truncate">
                      Hãng
                    </th>
                    <th className="w-24 px-4 py-3 font-medium truncate">
                      Số Lượng
                    </th>
                    <th className="w-28 px-4 py-3 font-medium truncate">
                      Giá tiền
                    </th>
                    <th className="w-48 px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-500">
                  {products && products.length > 0 ? (
                    products.map((product, index) => (
                      <tr key={index} className="border-t border-gray-500/20">
                        <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                          <div className="bg-gray-500/10 rounded p-2">
                            <Image
                              src={
                                product.images?.[0] || // Ưu tiên images
                                product.image?.[0] || // Fallback nếu dùng image
                                assets.placeholder_image
                              }
                              alt="Product Image"
                              className="w-16"
                              width={1280}
                              height={720}
                            />
                          </div>
                          <span className="truncate w-full">
                            {product.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {product.category?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-3">
                          {product.brand?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-3">
                          {product.stock !== undefined ? product.stock : "0"}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(product.offerPrice)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (product._id) {
                                  router.push(`/product/${product._id}`);
                                } else {
                                  console.error(
                                    "Error: product._id is undefined",
                                    product
                                  );
                                  toast.error("Product ID not found!");
                                }
                              }}
                              className="flex items-center gap-1 px-2 py-1 bg-orange-600 text-white rounded-md text-sm"
                            >
                              <span>Xem</span>
                              <Image
                                className="h-3.5"
                                src={assets.redirect_icon}
                                alt="redirect_icon"
                              />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
                            >
                              <span>Sửa</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                            >
                              <span>Xóa</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        Không Tìm Thấy Sản Phẩm
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Card layout for smaller screens (below sm) */}
            <div className="block sm:hidden w-full">
              {products && products.length > 0 ? (
                products.map((product, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-500/20 p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-500/10 rounded p-2">
                        <Image
                          src={
                            product.images?.[0] || // Ưu tiên images
                            product.image?.[0] || // Fallback nếu dùng image
                            assets.placeholder_image
                          }
                          alt="Product Image"
                          className="w-16"
                          width={1280}
                          height={720}
                        />
                      </div>
                      <span className="truncate text-sm font-medium">
                        {product.name}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Loại: </span>
                        {product.category?.name || "Unknown"}
                      </div>
                      <div>
                        <span className="font-medium">Hãng: </span>
                        {product.brand?.name || "Unknown"}
                      </div>
                      <div>
                        <span className="font-medium">Số Lượng: </span>
                        {product.stock !== undefined ? product.stock : "0"}
                      </div>
                      <div>
                        <span className="font-medium">Giá tiền: </span>
                        {formatCurrency(product.offerPrice)}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          if (product._id) {
                            router.push(`/product/${product._id}`);
                          } else {
                            console.error(
                              "Error: product._id is undefined",
                              product
                            );
                            toast.error("Product ID not found!");
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-orange-600 text-white rounded-md text-sm"
                      >
                        <span>Xem</span>
                        <Image
                          className="h-3.5"
                          src={assets.redirect_icon}
                          alt="redirect_icon"
                        />
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
                      >
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                      >
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-sm text-gray-500">
                  Không Tìm Thấy Sản Phẩm
                </div>
              )}
            </div>
          </div>

          {/* Form chỉnh sửa sản phẩm */}
          {editingProduct && (
            <div className="mt-6 max-w-lg">
              <h2 className="text-lg font-medium mb-4">Chỉnh Sửa Sản Phẩm</h2>
              <form onSubmit={handleUpdateProduct} className="space-y-5">
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="edit-name">
                    Tên Sản Phẩm
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    placeholder="Type here"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    value={formData.name || ""}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    className="text-base font-medium"
                    htmlFor="edit-description"
                  >
                    Chi Tiết Sản Phẩm
                  </label>
                  <textarea
                    id="edit-description"
                    rows={4}
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
                    placeholder="Nhập mô tả chi tiết sản phẩm (ví dụ: Tai nghe không dây, pin 20 giờ...)"
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    value={formData.description || ""}
                    required
                  />
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-category"
                    >
                      Loại
                    </label>
                    <select
                      id="edit-category"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={
                        (e) =>
                          setFormData({
                            ...formData,
                            categoryName: e.target.value,
                          }) // Đổi thành categoryName
                      }
                      value={formData.categoryName || ""}
                      disabled={categories.length === 0}
                    >
                      {categories.length === 0 ? (
                        <option value="">Không có loại nào</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-brand"
                    >
                      Hãng
                    </label>
                    <select
                      id="edit-brand"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={
                        (e) =>
                          setFormData({
                            ...formData,
                            brandName: e.target.value,
                          }) // Đổi thành brandName
                      }
                      value={formData.brandName || ""}
                      disabled={brands.length === 0}
                    >
                      {brands.length === 0 ? (
                        <option value="">Không có hãng nào</option>
                      ) : (
                        brands.map((br) => (
                          <option key={br._id} value={br.name}>
                            {br.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-price"
                    >
                      Giá Sản Phẩm
                    </label>
                    <input
                      id="edit-price"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      value={formData.price !== undefined ? formData.price : ""}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-offer-price"
                    >
                      Giá Ưu Đãi
                    </label>
                    <input
                      id="edit-offer-price"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setFormData({ ...formData, offerPrice: e.target.value })
                      }
                      value={
                        formData.offerPrice !== undefined
                          ? formData.offerPrice
                          : ""
                      }
                      required
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
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      value={
                        formData.stock !== undefined ? formData.stock : "0"
                      }
                      required
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
        </div>
      )}
      {/* <Footer /> */}
    </div>
  );
};

export default ProductList;
