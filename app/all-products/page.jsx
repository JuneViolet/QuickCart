// 'use client'
// import ProductCard from "@/components/ProductCard";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import { useAppContext } from "@/context/AppContext";

// const AllProducts = () => {

//     const { products } = useAppContext();

//     return (
//         <>
//             <Navbar />
//             <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
//                 <div className="flex flex-col items-end pt-12">
//                     <p className="text-2xl font-medium">Tất Cả Sản Phẩm</p>
//                     <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
//                 </div>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-12 pb-14 w-full">
//                     {products.map((product, index) => <ProductCard key={index} product={product} />)}
//                 </div>
//             </div>
//             <Footer />
//         </>
//     );
// };

// export default AllProducts;
"use client";
import { useState, useEffect } from "react"; // Thêm useState, useEffect
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios"; // Thêm axios để gọi API

const AllProducts = () => {
  const [products, setProducts] = useState([]); // State để lưu danh sách sản phẩm
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu

  // Hàm lấy danh sách sản phẩm từ API
  const fetchProducts = async (page) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/product/list?page=${page}`);
      console.log("AllProducts received:", data);
      if (data.success) {
        if (page === 1) {
          // Nếu là trang đầu tiên, thay thế danh sách sản phẩm
          setProducts(data.products || []);
        } else {
          // Nếu là trang tiếp theo, thêm sản phẩm vào danh sách hiện tại
          setProducts((prevProducts) => [
            ...prevProducts,
            ...(data.products || []),
          ]);
        }
        setTotalPages(data.totalPages || 1); // Cập nhật tổng số trang
      } else {
        console.error("Fetch Products Error:", data.message);
      }
    } catch (error) {
      console.error("Fetch Products Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount và khi currentPage thay đổi
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // Hàm xử lý khi nhấn nút "Xem thêm"
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
          <p className="text-2xl font-medium">Tất Cả Sản Phẩm</p>
          <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-12 pb-14 w-full">
          {products.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
        {/* Hiển thị nút "Xem thêm" nếu còn trang để tải */}
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
