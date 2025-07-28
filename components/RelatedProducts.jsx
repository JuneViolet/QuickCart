"use client";

import React from "react";
import ProductCard from "@/components/ProductCard";

const RelatedProducts = ({ relatedProducts, categoryName, router }) => {
  if (!relatedProducts || relatedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="mt-16 mb-16 text-center">
          <p className="text-xl text-gray-600 mb-2">
            Không có sản phẩm liên quan trong danh mục{" "}
            <span className="font-semibold text-orange-600">
              {categoryName}
            </span>
          </p>
          <p className="text-gray-500 mb-6">
            Khám phá thêm các sản phẩm khác trong cửa hàng của chúng tôi
          </p>
        </div>
        <button
          onClick={() => router.push("/all-products")}
          className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
        >
          Xem tất cả sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center mb-4 mt-16">
        <p className="text-3xl font-medium">
          Sản phẩm liên quan từ{" "}
          <span className="font-medium text-orange-600">{categoryName}</span>
        </p>
        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
        {relatedProducts.slice(0, 10).map((product, index) => (
          <ProductCard key={product._id || index} product={product} />
        ))}
      </div>
      <button
        onClick={() => router.push("/all-products")}
        className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
      >
        Xem tất cả sản phẩm
      </button>
    </div>
  );
};

export default RelatedProducts;
