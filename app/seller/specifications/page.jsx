// "use client";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import AddSpecification from "./AddSpecification";
// import { useRouter } from "next/navigation";

// const ManageSpecifications = () => {
//   const router = useRouter();
//   const [specifications, setSpecifications] = useState([]);
//   const [productId, setProductId] = useState("");
//   const [categoryId, setCategoryId] = useState("");
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [error, setError] = useState(""); // Thêm state để hiển thị lỗi

//   const fetchSpecs = async () => {
//     if (productId) {
//       try {
//         const response = await axios.get(`/api/specification/${productId}`, {
//           headers: { "Content-Type": "application/json" },
//           validateStatus: (status) => status >= 200 && status < 500, // Chấp nhận cả status 404
//         });
//         const data = response.data;
//         if (data.success) {
//           setSpecifications(data.specifications);
//           setError("");
//         } else {
//           setSpecifications([]); // Không có thông số, đặt danh sách rỗng
//           setError(data.message || "Không tìm thấy thông số.");
//         }
//       } catch (error) {
//         console.error("Fetch Specs Error:", {
//           message: error.message,
//           response: error.response?.data || error.response,
//           status: error.response?.status,
//           request: error.request,
//         });
//         setSpecifications([]);
//         setError(
//           "Lỗi khi tải thông số: " + (error.message || "Không xác định")
//         );
//       }
//     }
//   };

//   useEffect(() => {
//     fetchSpecs();
//   }, [productId]);

//   const handleAddSpec = () => {
//     if (!productId || !categoryId) {
//       alert("Vui lòng nhập Product ID và Category ID trước khi thêm thông số.");
//       return;
//     }
//     setShowAddForm(true);
//   };

//   const handleSpecAdded = () => {
//     setShowAddForm(false);
//     fetchSpecs();
//   };

//   const handleDeleteSpec = async (specId) => {
//     if (confirm("Bạn có chắc chắn muốn xóa thông số này?")) {
//       try {
//         const response = await axios.delete(`/api/specification/${productId}`, {
//           data: { specId },
//         });
//         if (response.data.success) {
//           fetchSpecs();
//         } else {
//           alert("Xóa thất bại: " + response.data.message);
//         }
//       } catch (error) {
//         console.error("Delete Error:", error.response?.data || error.message);
//         alert("Lỗi khi xóa thông số: " + error.message);
//       }
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-medium mb-4">Quản Lý Thông Số Kỹ Thuật</h1>
//       {error && <p className="text-red-500 mb-2">{error}</p>}
//       <div className="mb-4">
//         <input
//           type="text"
//           value={productId}
//           onChange={(e) => setProductId(e.target.value)}
//           placeholder="Nhập Product ID"
//           className="p-2 border rounded mr-2"
//         />
//         <input
//           type="text"
//           value={categoryId}
//           onChange={(e) => setCategoryId(e.target.value)}
//           placeholder="Nhập Category ID"
//           className="p-2 border rounded"
//         />
//         <button
//           onClick={handleAddSpec}
//           className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
//         >
//           Thêm Thông Số
//         </button>
//       </div>
//       {showAddForm && (
//         <AddSpecification
//           productId={productId}
//           categoryId={categoryId}
//           onClose={handleSpecAdded}
//         />
//       )}
//       <table className="w-full mt-4 border-collapse">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="p-2 border">Key</th>
//             <th className="p-2 border">Value</th>
//             <th className="p-2 border">Hành Động</th>
//           </tr>
//         </thead>
//         <tbody>
//           {specifications.map((spec) => (
//             <tr key={spec._id} className="border-t">
//               <td className="p-2 border">{spec.key}</td>
//               <td className="p-2 border">{spec.value}</td>
//               <td className="p-2 border">
//                 <button className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">
//                   Sửa
//                 </button>
//                 <button
//                   onClick={() => handleDeleteSpec(spec._id)}
//                   className="px-2 py-1 bg-red-500 text-white rounded"
//                 >
//                   Xóa
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ManageSpecifications;
// "use client";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import AddSpecification from "./AddSpecification";
// import { useRouter } from "next/navigation";

// const ManageSpecifications = () => {
//   const router = useRouter();
//   const [specifications, setSpecifications] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [selectedProduct, setSelectedProduct] = useState("");
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [error, setError] = useState("");

//   // Lấy danh sách danh mục
//   const fetchCategories = async () => {
//     try {
//       const { data } = await axios.get("/api/category/list");
//       if (data.success) {
//         setCategories(data.categories);
//       }
//     } catch (error) {
//       setError("Lỗi khi tải danh mục: " + error.message);
//     }
//   };

//   // Lấy danh sách sản phẩm theo danh mục
//   const fetchProducts = async (categoryId) => {
//     if (categoryId) {
//       try {
//         const { data } = await axios.get(
//           `/api/product/list?categoryId=${categoryId}`
//         );
//         if (data.success) {
//           setProducts(data.products);
//           setSelectedProduct(""); // Reset sản phẩm khi thay đổi danh mục
//         }
//       } catch (error) {
//         setError("Lỗi khi tải sản phẩm: " + error.message);
//       }
//     }
//   };

//   // Lấy thông số khi chọn sản phẩm
//   const fetchSpecs = async (productId) => {
//     if (productId) {
//       try {
//         const response = await axios.get(`/api/specification/${productId}`, {
//           headers: { "Content-Type": "application/json" },
//           validateStatus: (status) => status >= 200 && status < 500,
//         });
//         const data = response.data;
//         if (data.success) {
//           setSpecifications(data.specifications);
//           setError("");
//         } else {
//           setSpecifications([]);
//           setError(data.message || "Không tìm thấy thông số.");
//         }
//       } catch (error) {
//         console.error("Fetch Specs Error:", {
//           message: error.message,
//           response: error.response?.data,
//           status: error.response?.status,
//         });
//         setSpecifications([]);
//         setError(
//           "Lỗi khi tải thông số: " + (error.message || "Không xác định")
//         );
//       }
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     if (selectedCategory) {
//       fetchProducts(selectedCategory);
//     } else {
//       setProducts([]);
//     }
//   }, [selectedCategory]);

//   useEffect(() => {
//     if (selectedProduct) {
//       fetchSpecs(selectedProduct);
//     }
//   }, [selectedProduct]);

//   const handleAddSpec = () => {
//     if (!selectedProduct || !selectedCategory) {
//       setError("Vui lòng chọn danh mục và sản phẩm trước khi thêm thông số.");
//       return;
//     }
//     setShowAddForm(true);
//   };

//   const handleSpecAdded = () => {
//     setShowAddForm(false);
//     if (selectedProduct) {
//       fetchSpecs(selectedProduct);
//     }
//   };

//   const handleDeleteSpec = async (specId) => {
//     if (confirm("Bạn có chắc chắn muốn xóa thông số này?")) {
//       try {
//         const response = await axios.delete(
//           `/api/specification/${selectedProduct}`,
//           {
//             data: { specId },
//           }
//         );
//         if (response.data.success) {
//           fetchSpecs(selectedProduct);
//         } else {
//           alert("Xóa thất bại: " + response.data.message);
//         }
//       } catch (error) {
//         console.error("Delete Error:", error.response?.data || error.message);
//         alert("Lỗi khi xóa thông số: " + error.message);
//       }
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-medium mb-4">Quản Lý Thông Số Kỹ Thuật</h1>
//       {error && <p className="text-red-500 mb-2">{error}</p>}
//       <div className="mb-4 flex gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Chọn Danh Mục
//           </label>
//           <select
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//             className="p-2 border rounded w-full"
//           >
//             <option value="">-- Chọn danh mục --</option>
//             {categories.map((cat) => (
//               <option key={cat._id} value={cat._id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Chọn Sản Phẩm
//           </label>
//           <select
//             value={selectedProduct}
//             onChange={(e) => setSelectedProduct(e.target.value)}
//             className="p-2 border rounded w-full"
//             disabled={!selectedCategory}
//           >
//             <option value="">-- Chọn sản phẩm --</option>
//             {products.map((prod) => (
//               <option key={prod._id} value={prod._id}>
//                 {prod.name}
//               </option>
//             ))}
//           </select>
//         </div>
//         <button
//           onClick={handleAddSpec}
//           className="px-4 py-2 bg-green-500 text-white rounded mt-6"
//           disabled={!selectedProduct}
//         >
//           Thêm Thông Số
//         </button>
//       </div>
//       {showAddForm && (
//         <AddSpecification
//           productId={selectedProduct}
//           categoryId={selectedCategory}
//           onClose={handleSpecAdded}
//         />
//       )}
//       <table className="w-full mt-4 border-collapse">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="p-2 border">Key</th>
//             <th className="p-2 border">Value</th>
//             <th className="p-2 border">Hành Động</th>
//           </tr>
//         </thead>
//         <tbody>
//           {specifications.map((spec) => (
//             <tr key={spec._id} className="border-t">
//               <td className="p-2 border">{spec.key}</td>
//               <td className="p-2 border">{spec.value}</td>
//               <td className="p-2 border">
//                 <button className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">
//                   Sửa
//                 </button>
//                 <button
//                   onClick={() => handleDeleteSpec(spec._id)}
//                   className="px-2 py-1 bg-red-500 text-white rounded"
//                 >
//                   Xóa
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ManageSpecifications;
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import AddSpecification from "./AddSpecification";
import { useRouter } from "next/navigation";

const ManageSpecifications = () => {
  const router = useRouter();
  const [specifications, setSpecifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1); // Thêm state để xử lý trang

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/list");
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      setError("Lỗi khi tải danh mục: " + error.message);
    }
  };

  const fetchProducts = async (categoryId, pageNum = 1) => {
    if (categoryId) {
      try {
        const { data } = await axios.get(
          `/api/product/list?categoryId=${categoryId}&page=${pageNum}&limit=50` // Tăng limit lên 50
        );
        console.log("Products fetched for categoryId", categoryId, data);
        if (data.success) {
          setProducts(data.products);
          setSelectedProduct("");
          if (data.totalProducts > data.limit * pageNum) {
            // Nếu còn sản phẩm, có thể thêm logic lấy trang tiếp theo
          }
        } else {
          setError(data.message || "Không tìm thấy sản phẩm.");
          setProducts([]);
        }
      } catch (error) {
        setError("Lỗi khi tải sản phẩm: " + error.message);
        setProducts([]);
        console.error("Fetch Products Error:", error);
      }
    } else {
      setProducts([]);
    }
  };

  const fetchSpecs = async (productId) => {
    if (productId) {
      try {
        const response = await axios.get(`/api/specification/${productId}`, {
          headers: { "Content-Type": "application/json" },
          validateStatus: (status) => status >= 200 && status < 500,
        });
        const data = response.data;
        if (data.success) {
          setSpecifications(data.specifications);
          setError("");
        } else {
          setSpecifications([]);
          setError(data.message || "Không tìm thấy thông số.");
        }
      } catch (error) {
        console.error("Fetch Specs Error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setSpecifications([]);
        setError(
          "Lỗi khi tải thông số: " + (error.message || "Không xác định")
        );
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1); // Reset trang khi thay đổi danh mục
    if (selectedCategory) {
      fetchProducts(selectedCategory, 1);
    } else {
      setProducts([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedProduct) {
      fetchSpecs(selectedProduct);
    }
  }, [selectedProduct]);

  const handleAddSpec = () => {
    if (!selectedProduct || !selectedCategory) {
      setError("Vui lòng chọn danh mục và sản phẩm trước khi thêm thông số.");
      return;
    }
    setShowAddForm(true);
  };

  const handleSpecAdded = () => {
    setShowAddForm(false);
    if (selectedProduct) {
      fetchSpecs(selectedProduct);
    }
  };

  const handleDeleteSpec = async (specId) => {
    if (confirm("Bạn có chắc chắn muốn xóa thông số này?")) {
      try {
        const response = await axios.delete(
          `/api/specification/${selectedProduct}`,
          {
            data: { specId },
          }
        );
        if (response.data.success) {
          fetchSpecs(selectedProduct);
        } else {
          alert("Xóa thất bại: " + response.data.message);
        }
      } catch (error) {
        console.error("Delete Error:", error.response?.data || error.message);
        alert("Lỗi khi xóa thông số: " + error.message);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium mb-4">Quản Lý Thông Số Kỹ Thuật</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Chọn Danh Mục
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Chọn Sản Phẩm
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="p-2 border rounded w-full"
            disabled={!selectedCategory}
          >
            <option value="">-- Chọn sản phẩm --</option>
            {products.map((prod) => (
              <option key={prod._id} value={prod._id}>
                {prod.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAddSpec}
          className="px-4 py-2 bg-green-500 text-white rounded mt-6"
          disabled={!selectedProduct}
        >
          Thêm Thông Số
        </button>
      </div>
      {showAddForm && (
        <AddSpecification
          productId={selectedProduct}
          categoryId={selectedCategory}
          onClose={handleSpecAdded}
        />
      )}
      <table className="w-full mt-4 border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Key</th>
            <th className="p-2 border">Value</th>
            <th className="p-2 border">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {specifications.map((spec) => (
            <tr key={spec._id} className="border-t">
              <td className="p-2 border">{spec.key}</td>
              <td className="p-2 border">
                {Array.isArray(spec.value) ? (
                  <ul className="list-disc list-inside">
                    {spec.value.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  spec.value
                )}
              </td>
              <td className="p-2 border">
                <button className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteSpec(spec._id)}
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

export default ManageSpecifications;
