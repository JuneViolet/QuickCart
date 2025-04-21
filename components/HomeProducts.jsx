
import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {
  const { products, router } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    "All",
    "Earphone",
    "Headphone",
    "Watch",
    "Smartphone",
    "Laptop",
    "Camera",
    "Accessories",
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearchTerm = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || selectedCategory === "All"
        ? true
        : product.category === selectedCategory;
    return matchesSearchTerm && matchesCategory;
  });

  // Kiểm tra số lượng sản phẩm
  useEffect(() => {
    console.log("Total filtered products:", filteredProducts.length);
    console.log("Displayed products:", filteredProducts.slice(0, 8).length);
  }, [filteredProducts]);

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
            onChange={(e) => setSelectedCategory(e.target.value)}
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

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
          {filteredProducts.slice(0, 10).map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-6">Không tìm thấy sản phẩm nào.</p>
      )}

      <button
        onClick={() => router.push("/all-products")}
        className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
      >
        See more
      </button>
    </div>
  );
};

export default HomeProducts;
