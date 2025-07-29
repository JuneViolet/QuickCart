// app/all-products/page.jsx
"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { debounce } from "lodash";

// Component con để xử lý logic với useSearchParams
function ProductList() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [brands, setBrands] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
  const [sortOrder, setSortOrder] = useState("");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const isDragging = useRef({ min: false, max: false });

  const normalizeSearchTerm = (term) =>
    term
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)}M`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K`;
    }
    return price.toString();
  };

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

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/brand/list");
      const data = await res.json();
      if (data.success) {
        const brandNames = data.brands.map((brand) => brand.name);
        setBrands(["All", ...brandNames]);
      } else {
        console.error("Fetch brands error:", data.message);
      }
    } catch (err) {
      console.error("Fetch brands error:", err.message);
    }
  };

  const fetchProducts = useCallback(
    async (
      query = "",
      category = "",
      brand = "",
      minPrice = 0,
      maxPrice = 100000000,
      sort = ""
    ) => {
      setLoading(true);
      try {
        // Đảm bảo minPrice <= maxPrice và giới hạn maxPrice ở 100 triệu
        minPrice = Math.min(minPrice, maxPrice);
        maxPrice = Math.min(maxPrice, 100000000);

        let url;
        const normalizedQuery = normalizeSearchTerm(query);
        // Không normalize category và brand, gửi tên gốc
        const categoryParam = category !== "All" ? category : "";
        const brandParam = brand !== "All" ? brand : "";

        url = `/api/product/list?page=${page}&limit=12${
          normalizedQuery ? `&query=${encodeURIComponent(normalizedQuery)}` : ""
        }${
          categoryParam ? `&category=${encodeURIComponent(categoryParam)}` : ""
        }${brandParam ? `&brand=${encodeURIComponent(brandParam)}` : ""}${
          minPrice > 0 ? `&minPrice=${minPrice}` : ""
        }${maxPrice < 100000000 ? `&maxPrice=${maxPrice}` : ""}${
          sort ? `&sort=${sort}` : ""
        }`;

        console.log("Fetching URL:", url); // Log để debug
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          console.log("Products received:", data.products); // Log để kiểm tra dữ liệu
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
      } finally {
        setLoading(false);
      }
    },
    [page]
  );

  const debouncedFetchProducts = useCallback(
    debounce((query, category, brand, minPrice, maxPrice, sort) => {
      fetchProducts(query, category, brand, minPrice, maxPrice, sort);
    }, 800),
    [fetchProducts]
  );

  const resetFilters = () => {
    setPriceRange({ min: 0, max: 100000000 });
    setSortOrder("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setPage(1);
    setSearchTerm(""); // Reset ô tìm kiếm khi xóa bộ lọc
  };

  const handlePriceChange = (field, value) => {
    const newValue = Math.max(0, parseInt(value) || 0);
    setPriceRange((prev) => {
      if (field === "min") {
        return { ...prev, min: newValue > prev.max ? prev.max : newValue };
      } else if (field === "max") {
        const cappedValue = Math.min(newValue, 100000000);
        return {
          ...prev,
          max: cappedValue < prev.min ? prev.min : cappedValue,
        };
      }
      return prev;
    });
  };

  const handleSliderChange = (field, value) => {
    const newValue = Math.max(0, parseInt(value) || 0);
    if (field === "min" && !isDragging.current.max) {
      setPriceRange((prev) => ({
        ...prev,
        min: newValue > prev.max ? prev.max : newValue,
      }));
    } else if (field === "max" && !isDragging.current.min) {
      const cappedValue = Math.min(newValue, 100000000);
      setPriceRange((prev) => ({
        ...prev,
        max: cappedValue < prev.min ? prev.min : cappedValue,
      }));
    }
  };

  const handleSliderMouseDown = (field) => {
    isDragging.current[field] = true;
  };

  const handleSliderMouseUp = () => {
    isDragging.current = { min: false, max: false };
    setPriceRange((prev) => ({
      min: Math.min(prev.min, prev.max),
      max: Math.max(prev.min, prev.max),
    }));
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    const categoryFromUrl = searchParams.get("category") || "All";
    const brandFromUrl = searchParams.get("brand") || "All";
    const minPriceFromUrl = parseInt(searchParams.get("minPrice")) || 0;
    const maxPriceFromUrl = parseInt(searchParams.get("maxPrice")) || 100000000;
    const sortFromUrl = searchParams.get("sort") || "";
    const queryFromUrl = searchParams.get("query") || "";
    setSelectedCategory(categoryFromUrl);
    setSelectedBrand(brandFromUrl);
    setSearchTerm(queryFromUrl); // Set searchTerm từ URL
    setPriceRange({
      min: minPriceFromUrl,
      max: Math.min(maxPriceFromUrl, 100000000),
    });
    setSortOrder(sortFromUrl);
    debouncedFetchProducts(
      queryFromUrl,
      categoryFromUrl,
      brandFromUrl,
      minPriceFromUrl,
      Math.min(maxPriceFromUrl, 100000000),
      sortFromUrl
    );
  }, []);

  useEffect(() => {
    console.log("Price Range updated:", priceRange); // Log để debug
    debouncedFetchProducts(
      searchTerm,
      selectedCategory,
      selectedBrand,
      priceRange.min,
      priceRange.max,
      sortOrder
    );
  }, [
    page,
    selectedCategory,
    selectedBrand,
    priceRange,
    sortOrder,
    debouncedFetchProducts,
  ]);

  useEffect(() => {
    debouncedFetchProducts(
      searchTerm,
      selectedCategory,
      selectedBrand,
      priceRange.min,
      priceRange.max,
      sortOrder
    );
  }, [searchTerm, debouncedFetchProducts]);

  useEffect(() => {
    return () => {
      debouncedFetchProducts.cancel();
    };
  }, [debouncedFetchProducts]);

  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-32 pt-12">
      {/* Header */}
      <div className="flex flex-col w-full mb-6 gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
          <div className="flex flex-col items-start">
            <p className="text-2xl font-medium text-left">Tất Cả Sản Phẩm</p>
            <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-2"></div>
          </div>

          {/* Search and Category */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                🔍
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-white"
            >
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Section */}
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                showPriceFilter
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">💰</span>
              Lọc theo giá
              <span
                className={`transform transition-transform duration-200 ${
                  showPriceFilter ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-white min-w-[160px]"
            >
              <option value="">Sắp xếp theo giá</option>
              <option value="low-to-high">Thấp → Cao</option>
              <option value="high-to-low">Cao → Thấp</option>
            </select>

            {(priceRange.min > 0 ||
              priceRange.max < 100000000 ||
              sortOrder ||
              selectedCategory !== "All" ||
              selectedBrand !== "All" ||
              searchTerm) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
              >
                <span>✕</span> Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Price Filter Panel */}
          {showPriceFilter && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <span className="text-xl">💰</span>
                Khoảng giá mong muốn
              </h3>

              {/* Price Display */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-sm text-gray-500">Từ</span>
                    <div className="font-bold text-orange-600 text-lg">
                      {formatPrice(priceRange.min)} VND
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                  <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-sm text-gray-500">Đến</span>
                    <div className="font-bold text-orange-600 text-lg">
                      {formatPrice(priceRange.max)} VND
                    </div>
                  </div>
                </div>

                {/* Dual Range Slider */}
                <div className="relative mb-6">
                  <div className="flex items-center space-y-2">
                    <div className="relative w-full">
                      <input
                        type="range"
                        min="0"
                        max="100000000"
                        value={priceRange.min}
                        onChange={(e) =>
                          handleSliderChange("min", e.target.value)
                        }
                        onMouseDown={() => handleSliderMouseDown("min")}
                        onMouseUp={handleSliderMouseUp}
                        onTouchStart={() => handleSliderMouseDown("min")}
                        onTouchEnd={handleSliderMouseUp}
                        className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb z-10"
                        style={{ background: "transparent" }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100000000"
                        value={priceRange.max}
                        onChange={(e) =>
                          handleSliderChange("max", e.target.value)
                        }
                        onMouseDown={() => handleSliderMouseDown("max")}
                        onMouseUp={handleSliderMouseUp}
                        onTouchStart={() => handleSliderMouseDown("max")}
                        onTouchEnd={handleSliderMouseUp}
                        className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                      {/* Progress bar */}
                      <div
                        className="absolute h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg"
                        style={{
                          left: `${(priceRange.min / 100000000) * 100}%`,
                          width: `${
                            ((priceRange.max - priceRange.min) / 100000000) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Manual Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá tối thiểu (VND)
                    </label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                      placeholder="0"
                      min="0"
                      max="100000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá tối đa (VND)
                    </label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                      placeholder="100000000"
                      min="0"
                      max="100000000"
                    />
                  </div>
                </div>

                {/* Quick Price Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    { label: "Dưới 1M", min: 0, max: 1000000 },
                    { label: "1M - 5M", min: 1000000, max: 5000000 },
                    { label: "5M - 10M", min: 5000000, max: 10000000 },
                    { label: "10M - 60M", min: 10000000, max: 60000000 },
                    { label: "Trên 60M", min: 60000000, max: 100000000 },
                  ].map((range, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setPriceRange({ min: range.min, max: range.max });
                        debouncedFetchProducts(
                          searchTerm,
                          selectedCategory,
                          selectedBrand,
                          range.min,
                          range.max,
                          sortOrder
                        ); // Gọi ngay lập tức
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        priceRange.min === range.min &&
                        priceRange.max === range.max
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-orange-50 hover:border-orange-200"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(priceRange.min > 0 ||
            priceRange.max < 100000000 ||
            sortOrder ||
            selectedCategory !== "All" ||
            selectedBrand !== "All" ||
            searchTerm) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(priceRange.min > 0 || priceRange.max < 100000000) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 border border-orange-200">
                  {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}{" "}
                  VND
                </span>
              )}
              {sortOrder && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                  {sortOrder === "low-to-high" ? "Thấp → Cao" : "Cao → Thấp"}
                </span>
              )}
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200">
                  {selectedCategory}
                </span>
              )}
              {selectedBrand !== "All" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {selectedBrand}
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
                  {searchTerm}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            <p className="text-gray-500 text-lg mt-4">Đang tải sản phẩm...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
            {products.map((product, index) => (
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
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg text-center">
              Không tìm thấy sản phẩm nào phù hợp
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex gap-4 mt-8 pb-14">
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src={assets.arrow_left1}
                alt="Previous"
                className="w-4 h-4"
              />
            </button>

            <span className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">
              Trang {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image src={assets.arrow_right1} alt="Next" className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #ea580c);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 8px rgba(249, 115, 22, 0.3);
          transition: all 0.2s ease;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(249, 115, 22, 0.4);
        }

        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #ea580c);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 8px rgba(249, 115, 22, 0.3);
        }

        .slider-thumb::-webkit-slider-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}

// Component chính
export default function AllProducts() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="text-center pt-14">Đang tải...</div>}>
        <ProductList />
      </Suspense>
      <Footer />
    </>
  );
}
