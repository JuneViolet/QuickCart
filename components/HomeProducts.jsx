// "use client";

// import React, { useState, useEffect } from "react";
// import ProductCard from "./ProductCard";
// import { useAppContext } from "@/context/AppContext";
// import { assets } from "@/assets/assets";
// import Image from "next/image";
// import { debounce } from "lodash"; // Cần cài đặt lodash: npm install lodash

// const HomeProducts = () => {
//   const { router } = useAppContext();
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState(["All"]);
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const normalizeSearchTerm = (term) =>
//     term
//       .toLowerCase()
//       .trim()
//       .replace(/\s+/g, " ")
//       .normalize("NFD")
//       .replace(/[\u0300-\u036f]/g, "")
//       .replace(/đ/g, "d");

//   const fetchCategories = async () => {
//     try {
//       const res = await fetch("/api/category/list");
//       const data = await res.json();
//       if (data.success) {
//         const categoryNames = data.categories.map((cat) => cat.name);
//         setCategories(["All", ...categoryNames]);
//       } else {
//         console.error("Fetch categories error:", data.message);
//       }
//     } catch (err) {
//       console.error("Fetch categories error:", err.message);
//     }
//   };

//   const fetchProducts = async (query = "", category = "") => {
//     try {
//       let url;
//       const normalizedQuery = normalizeSearchTerm(query);

//       if (normalizedQuery) {
//         url = `/api/search?query=${encodeURIComponent(normalizedQuery)}`;
//       } else {
//         url = `/api/product/list?page=${page}&limit=10&category=${category}`;
//       }

//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.success) {
//         setProducts(data.products || []);
//         setTotalPages(data.totalPages || 1); // Fallback để tránh lỗi
//       } else {
//         console.error("Fetch Products Error:", data.message);
//         setProducts([]);
//         setTotalPages(1);
//       }
//     } catch (error) {
//       console.error("Fetch Products Error:", error.message);
//       setProducts([]);
//       setTotalPages(1);
//     }
//   };

//   // Debounced fetchProducts
//   const debouncedFetchProducts = debounce((query, category) => {
//     fetchProducts(query, category);
//   }, 500); // Chờ 500ms trước khi gọi API

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     debouncedFetchProducts("", selectedCategory);
//   }, [page, selectedCategory]);

//   useEffect(() => {
//     debouncedFetchProducts(searchTerm, selectedCategory);
//   }, [searchTerm]);

//   // Cleanup debounce khi component unmount
//   useEffect(() => {
//     return () => {
//       debouncedFetchProducts.cancel();
//     };
//   }, []);

//   return (
//     <div className="flex flex-col items-center pt-14">
//       <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-6 gap-4">
//         <p className="text-2xl font-medium text-left">Sản Phẩm Phổ Biến</p>
//         <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
//           <div className="relative w-full sm:w-64">
//             <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
//               🔍
//             </span>
//             <input
//               type="text"
//               placeholder="Tìm kiếm sản phẩm (iPhone, Samsung...)"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
//             />
//           </div>
//           <select
//             value={selectedCategory}
//             onChange={(e) => {
//               setSelectedCategory(e.target.value);
//               setPage(1); // Reset page khi chọn category khác
//             }}
//             className="px-4 py-2 border rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-orange-500"
//           >
//             {categories.map((category) => (
//               <option key={category} value={category}>
//                 {category}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {products.length > 0 ? (
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
//           {products.slice(0, 10).map((product, index) => (
//             <ProductCard
//               key={index}
//               product={{
//                 ...product,
//                 images:
//                   product.images && product.images.length > 0
//                     ? product.images
//                     : [assets.placeholder_image],
//                 image:
//                   product.image && product.image.length > 0
//                     ? product.image[0]
//                     : assets.placeholder_image,
//               }}
//             />
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-500 mt-6">
//           Không tìm thấy sản phẩm nào. Hãy thử từ khóa khác!
//         </p>
//       )}

//       <div className="flex gap-4 mt-4">
//         {totalPages > 1 && (
//           <div className="flex gap-2">
//             <button
//               onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
//               disabled={page === 1}
//               className="px-4 py-2 border rounded text-gray-500/70 hover:bg-slate-50/90 transition disabled:opacity-50"
//             >
//               <Image
//                 src={assets.arrow_left1}
//                 alt="Previous"
//                 className="w-4 h-4"
//               />
//             </button>
//             <button
//               onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
//               disabled={page === totalPages}
//               className="px-4 py-2 border rounded text-gray-500/70 hover:bg-slate-50/90 transition disabled:opacity-50"
//             >
//               <Image src={assets.arrow_right1} alt="Next" className="w-4 h-4" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HomeProducts;
"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { debounce } from "lodash"; // Cần cài đặt lodash: npm install lodash
import { useSearchParams } from "next/navigation"; // Thêm để lấy query từ URL

const HomeProducts = () => {
  const { router } = useAppContext();
  const searchParams = useSearchParams(); // Lấy query từ URL
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState(""); // Thêm state cho brand
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const normalizeSearchTerm = (term) =>
    term
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/category/list");
      const data = await res.json();
      if (data.success) {
        const categoryNames = data.categories.map((cat) => cat.name);
        setCategories(["All", ...categoryNames]);
      } else {
        console.error("Fetch categories error:", data.message);
      }
    } catch (err) {
      console.error("Fetch categories error:", err.message);
    }
  };

  const fetchProducts = async (query = "", category = "", brand = "") => {
    try {
      let url;
      const normalizedQuery = normalizeSearchTerm(query);
      const normalizedCategory =
        category !== "All" ? normalizeSearchTerm(category) : "";
      const normalizedBrand = brand ? normalizeSearchTerm(brand) : "";

      if (normalizedQuery) {
        url = `/api/search?query=${encodeURIComponent(normalizedQuery)}`;
      } else {
        url = `/api/product/list?page=${page}&limit=10${
          normalizedCategory
            ? `&category=${encodeURIComponent(normalizedCategory)}`
            : ""
        }${
          normalizedBrand ? `&brand=${encodeURIComponent(normalizedBrand)}` : ""
        }`;
      }

      console.log("Fetching URL:", url); // Debug
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Fetch Products Error:", data.message);
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Fetch Products Error:", error.message);
      setProducts([]);
      setTotalPages(1);
    }
  };

  // Debounced fetchProducts
  const debouncedFetchProducts = debounce((query, category, brand) => {
    fetchProducts(query, category, brand);
  }, 500);

  useEffect(() => {
    fetchCategories();
    // Lấy category và brand từ URL khi component mount
    const categoryFromUrl = searchParams.get("category") || "All";
    const brandFromUrl = searchParams.get("brand") || "";
    setSelectedCategory(categoryFromUrl);
    setSelectedBrand(brandFromUrl);
    debouncedFetchProducts("", categoryFromUrl, brandFromUrl);
  }, []);

  useEffect(() => {
    debouncedFetchProducts("", selectedCategory, selectedBrand);
  }, [page, selectedCategory, selectedBrand]);

  useEffect(() => {
    debouncedFetchProducts(searchTerm, selectedCategory, selectedBrand);
  }, [searchTerm]);

  // Cleanup debounce khi component unmount
  useEffect(() => {
    return () => {
      debouncedFetchProducts.cancel();
    };
  }, []);

  return (
    <div className="flex flex-col items-center pt-14">
      <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-6 gap-4">
        <p className="text-2xl font-medium text-left">Sản Phẩm Phổ Biến</p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm (iPhone, Samsung...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {/* Thêm select cho brand (tùy chọn) */}
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tất cả thương hiệu</option>
            {/* Giả sử bạn có danh sách brand, thêm options từ API /api/brand/list */}
            {/* <option value="samsung">Samsung</option>
            <option value="apple">Apple</option> */}
          </select>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
          {products.slice(0, 10).map((product, index) => (
            <ProductCard
              key={index}
              product={{
                ...product,
                images:
                  product.images && product.images.length > 0
                    ? product.images
                    : [assets.placeholder_image],
                image:
                  product.image && product.image.length > 0
                    ? product.image[0]
                    : assets.placeholder_image,
                averageRating: product.averageRating || 0,
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-6">
          Không tìm thấy sản phẩm nào. Hãy thử từ khóa khác!
        </p>
      )}

      <div className="flex gap-4 mt-4">
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded text-gray-500/70 hover:bg-slate-50/90 transition disabled:opacity-50"
            >
              <Image
                src={assets.arrow_left1}
                alt="Previous"
                className="w-4 h-4"
              />
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded text-gray-500/70 hover:bg-slate-50/90 transition disabled:opacity-50"
            >
              <Image src={assets.arrow_right1} alt="Next" className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeProducts;

