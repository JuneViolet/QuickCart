"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

// Hàm chuẩn hóa chuỗi
const normalizeString = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");

const MegaMenu = ({ categories }) => {
  return (
    <div className="w-full max-w-6xl mx-auto bg-white shadow-lg border rounded-lg overflow-hidden">
      {/* Desktop/Tablet Grid Layout */}
      <div className="hidden sm:grid gap-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categories.slice(0, 10).map((category) => (
          <div
            key={category._id}
            className="p-4 border-r border-b border-gray-100 last:border-r-0 hover:bg-gray-50 transition-colors duration-200"
          >
            <Link
              href={`/all-products?category=${encodeURIComponent(
                category.name
              )}`}
              passHref
              legacyBehavior
            >
              <a
                className={cn(
                  "block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-all duration-200 hover:bg-blue-50 group"
                )}
              >
                <div className="text-sm font-semibold leading-tight text-gray-800 group-hover:text-blue-600 mb-1">
                  {category.name}
                </div>
                <p className="text-xs leading-snug text-gray-500 group-hover:text-blue-500">
                  Xem tất cả sản phẩm
                </p>
              </a>
            </Link>
            {category.subcategories?.length > 0 && (
              <div className="mt-3 space-y-1">
                {category.subcategories.map((sub) => (
                  <div key={sub._id || sub.name}>
                    <Link
                      href={`/all-products?category=${encodeURIComponent(
                        category.name
                      )}&brand=${encodeURIComponent(sub.name)}`}
                      passHref
                      legacyBehavior
                    >
                      <a
                        className={cn(
                          "flex items-center gap-2 select-none rounded-sm py-1 px-2 leading-none no-underline text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150"
                        )}
                      >
                        {/* Logo brand */}
                        {sub.logo ? (
                          <div className="w-4 h-4 flex-shrink-0">
                            <Image
                              src={sub.logo}
                              alt={`${sub.name} logo`}
                              className="w-full h-full object-contain rounded-sm"
                              width={16}
                              height={16}
                            />
                          </div>
                        ) : (
                          <div className="w-4 h-4 flex-shrink-0 bg-gray-200 rounded-sm flex items-center justify-center">
                            <span className="text-[8px] text-gray-500 font-medium">
                              {sub.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="truncate">{sub.name}</span>
                      </a>
                    </Link>
                  </div>
                ))}
                {category.subcategories.length > 10 && (
                  <div className="text-xs text-gray-400 italic py-1 px-2">
                    +{category.subcategories.length - 4} khác
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile List Layout */}
      <div className="sm:hidden divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {categories.slice(0, 8).map((category) => (
          <div key={category._id} className="p-3">
            <Link
              href={`/all-products?category=${encodeURIComponent(
                category.name
              )}`}
              passHref
              legacyBehavior
            >
              <a className="block text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors">
                {category.name}
              </a>
            </Link>
            {category.subcategories?.length > 0 && (
              <div className="mt-2 ml-3 space-y-1">
                {category.subcategories.slice(0, 3).map((sub) => (
                  <Link
                    key={sub._id || sub.name}
                    href={`/all-products?category=${encodeURIComponent(
                      category.name
                    )}&brand=${encodeURIComponent(sub.name)}`}
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                  >
                    {/* Logo brand */}
                    {sub.logo ? (
                      <div className="w-3 h-3 flex-shrink-0">
                        <Image
                          src={sub.logo}
                          alt={`${sub.name} logo`}
                          className="w-full h-full object-contain rounded-sm"
                          width={12}
                          height={12}
                        />
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex-shrink-0 bg-gray-200 rounded-sm flex items-center justify-center">
                        <span className="text-[6px] text-gray-500 font-medium">
                          {sub.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="truncate">{sub.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length > 10 && (
        <div className="p-4 bg-gray-50 border-t text-center">
          <Link
            href="/all-products"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Xem tất cả danh mục →
          </Link>
        </div>
      )}
    </div>
  );
};

export default MegaMenu;
