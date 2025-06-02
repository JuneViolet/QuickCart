// // app/all-products/page.jsx
// "use client";
// import { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation"; // Thay useRouter bằng useSearchParams
// import ProductCard from "@/components/ProductCard";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import axios from "axios";

// const AllProducts = () => {
//   const searchParams = useSearchParams(); // Lấy query params
//   const [products, setProducts] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [category, setCategory] = useState(null);
//   const [cancelToken, setCancelToken] = useState(null);

//   useEffect(() => {
//     const cat = searchParams.get("category") || "";
//     console.log(
//       "Category from searchParams:",
//       cat,
//       "at",
//       new Date().toISOString()
//     );
//     setCategory(cat);
//     setCurrentPage(1); // Reset về trang 1 khi danh mục thay đổi
//   }, [searchParams]); // Theo dõi thay đổi searchParams

//   useEffect(() => {
//     if (category === null) return;
//     console.log(
//       "Fetching products for category:",
//       category,
//       "page:",
//       currentPage,
//       "at",
//       new Date().toISOString()
//     );

//     if (cancelToken) {
//       cancelToken.cancel("Request canceled due to new fetch");
//     }

//     const source = axios.CancelToken.source();
//     setCancelToken(source);

//     fetchProducts(currentPage, source.token);

//     return () => {
//       source.cancel("Request canceled on cleanup");
//     };
//   }, [currentPage, category]);

//   const fetchProducts = async (page, token) => {
//     try {
//       setLoading(true);
//       const url = `/api/product/list?page=${page}${
//         category ? `&category=${category}` : ""
//       }`;
//       console.log("API Call:", url, "at", new Date().toISOString());
//       const { data } = await axios.get(url, { cancelToken: token });
//       console.log("API Response:", data, "at", new Date().toISOString());
//       if (data.success) {
//         if (page === 1) {
//           setProducts(data.products || []);
//         } else {
//           setProducts((prevProducts) => [
//             ...prevProducts,
//             ...(data.products || []),
//           ]);
//         }
//         setTotalPages(data.totalPages || 1);
//       } else {
//         console.error(
//           "Fetch Products Error:",
//           data.message,
//           "at",
//           new Date().toISOString()
//         );
//         setProducts([]);
//       }
//     } catch (error) {
//       if (axios.isCancel(error)) {
//         console.log(
//           "Fetch canceled:",
//           error.message,
//           "at",
//           new Date().toISOString()
//         );
//       } else {
//         console.error(
//           "Fetch Products Error:",
//           error.message,
//           "at",
//           new Date().toISOString()
//         );
//         setProducts([]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLoadMore = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage((prevPage) => prevPage + 1);
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
//         <div className="flex flex-col items-end pt-12">
//           <p className="text-2xl font-medium">
//             {category ? `Sản phẩm danh mục ${category}` : "Tất Cả Sản Phẩm"}
//           </p>
//           <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
//         </div>
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-12 pb-14 w-full">
//           {products.length > 0 ? (
//             products.map((product, index) => (
//               <ProductCard key={index} product={product} />
//             ))
//           ) : (
//             <p>Không tìm thấy sản phẩm trong danh mục này.</p>
//           )}
//         </div>
//         {currentPage < totalPages && (
//           <div className="flex justify-center w-full pb-14">
//             <button
//               onClick={handleLoadMore}
//               className="px-8 py-2 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
//               disabled={loading}
//             >
//               {loading ? "Đang tải..." : "Xem thêm"}
//             </button>
//           </div>
//         )}
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default AllProducts;
// app/all-products/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";

const AllProducts = () => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(null);
  const [brand, setBrand] = useState(null); // Thêm state cho brand
  const [cancelToken, setCancelToken] = useState(null);

  useEffect(() => {
    const cat = searchParams.get("category") || "";
    const br = searchParams.get("brand") || "";
    console.log(
      "Category from searchParams:",
      cat,
      "at",
      new Date().toISOString()
    );
    console.log("Brand from searchParams:", br, "at", new Date().toISOString());
    setCategory(cat);
    setBrand(br);
    setCurrentPage(1); // Reset về trang 1 khi danh mục hoặc hãng thay đổi
  }, [searchParams]);

  useEffect(() => {
    if (category === null) return;
    console.log(
      "Fetching products for category:",
      category,
      "brand:",
      brand,
      "page:",
      currentPage,
      "at",
      new Date().toISOString()
    );

    if (cancelToken) {
      cancelToken.cancel("Request canceled due to new fetch");
    }

    const source = axios.CancelToken.source();
    setCancelToken(source);

    fetchProducts(currentPage, source.token);
  }, [currentPage, category, brand]);

  const fetchProducts = async (page, token) => {
    try {
      setLoading(true);
      let url = `/api/product/list?page=${page}${
        category ? `&category=${category}` : ""
      }`;
      if (brand) {
        url += `&brand=${brand}`; // Thêm brand vào URL API
      }
      console.log("API Call:", url, "at", new Date().toISOString());
      const { data } = await axios.get(url, { cancelToken: token });
      console.log("API Response:", data, "at", new Date().toISOString());
      if (data.success) {
        if (page === 1) {
          setProducts(data.products || []);
        } else {
          setProducts((prevProducts) => [
            ...prevProducts,
            ...(data.products || []),
          ]);
        }
        setTotalPages(data.totalPages || 1);
      } else {
        console.error(
          "Fetch Products Error:",
          data.message,
          "at",
          new Date().toISOString()
        );
        setProducts([]);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log(
          "Fetch canceled:",
          error.message,
          "at",
          new Date().toISOString()
        );
      } else {
        console.error(
          "Fetch Products Error:",
          error.message,
          "at",
          new Date().toISOString()
        );
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
        <div className="flex flex-col items-end pt-12">
          <p className="text-2xl font-medium">
            {category
              ? `Sản phẩm danh mục ${category}${
                  brand ? ` - Hãng ${brand}` : ""
                }`
              : "Tất Cả Sản Phẩm"}
          </p>
          <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-12 pb-14 w-full">
          {products.length > 0 ? (
            products.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))
          ) : (
            <p>Không tìm thấy sản phẩm trong danh mục này.</p>
          )}
        </div>
        {currentPage < totalPages && (
          <div className="flex justify-center w-full pb-14">
            <button
              onClick={handleLoadMore}
              className="px-8 py-2 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
              disabled={loading}
            >
              {loading ? "Đang tải..." : "Xem thêm"}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AllProducts;
