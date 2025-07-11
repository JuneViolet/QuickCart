// import React, { useState, useEffect } from "react";
// import ProductCard from "./ProductCard";
// import { useAppContext } from "@/context/AppContext";
// import { assets } from "@/assets/assets";
// import Image from "next/image";

// const HomeProducts = () => {
//   const { router } = useAppContext();
//   const [products, setProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const categories = [
//     "All",
//     "Tai Nghe",
//     "Headphone",
//     "Watch",
//     "Điện Thoại",
//     "Laptop",
//     "Camera",
//     "Accessories",
//   ];

//   const fetchProducts = async (query = "", category = "") => {
//     try {
//       const url = query
//         ? `/api/search?query=${query}`
//         : `/api/product/list?page=${page}&limit=10&category=${category}`;
//       const response = await fetch(url);
//       const data = await response.json();
//       if (data.success) {
//         console.log("Fetched products:", data.products);
//         data.products.forEach((prod, idx) => {
//           console.log(`Product ${idx}:`, prod);
//           console.log(
//             `Product ${idx} images:`,
//             prod.images,
//             "image:",
//             prod.image
//           );
//           console.log(`Product ${idx} category:`, prod.category);
//         });
//         setProducts(data.products);
//         setTotalPages(data.totalPages || 1);
//       } else {
//         console.error("Fetch Products Error:", data.message);
//       }
//     } catch (error) {
//       console.error("Fetch Products Error:", error.message);
//     }
//   };

//   useEffect(() => {
//     fetchProducts("", selectedCategory); // Lấy dữ liệu theo category
//   }, [page, selectedCategory]); // Phản ứng với page và selectedCategory

//   useEffect(() => {
//     if (searchTerm) {
//       fetchProducts(searchTerm, selectedCategory); // Tìm kiếm với category
//     }
//   }, [searchTerm, selectedCategory]);

//   const filteredProducts = products; // Không cần lọc thêm, API đã xử lý

//   useEffect(() => {
//     console.log("Total filtered products:", filteredProducts.length);
//     console.log("Displayed products:", filteredProducts.slice(0, 8).length);
//     console.log("Filtered products with ratings:", filteredProducts);
//   }, [filteredProducts]);

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
//             onChange={(e) => setSelectedCategory(e.target.value)}
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

//       {filteredProducts.length > 0 ? (
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
//           {filteredProducts.slice(0, 10).map((product, index) => (
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
//         <p className="text-gray-500 mt-6">Không tìm thấy sản phẩm nào.</p>
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

const HomeProducts = () => {
  const { router } = useAppContext();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
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

  const fetchProducts = async (query = "", category = "") => {
    try {
      const normalizedQuery = normalizeSearchTerm(query);
      let url;

      if (normalizedQuery) {
        url = `/api/search?query=${encodeURIComponent(normalizedQuery)}`;
      } else {
        url = `/api/product/list?page=${page}&limit=10&category=${category}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1); // fallback để không vỡ layout
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts("", selectedCategory);
  }, [page, selectedCategory]);

  useEffect(() => {
    fetchProducts(searchTerm, selectedCategory);
  }, [searchTerm]);

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
              setPage(1); // reset page khi chọn category khác
            }}
            className="px-4 py-2 border rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
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
