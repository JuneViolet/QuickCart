"use client";

import React, { useState } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

const ProductSpecifications = ({ specifications }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!specifications || specifications.length === 0) {
    return null;
  }

  // Hiển thị tối đa 3 thông số đầu tiên
  const previewCount = 3;
  const hasMore = specifications.length > previewCount;

  return (
    <>
      <div className="mt-6">
        <h2 className="text-xl font-semibold flex justify-center mb-4">
          Thông Số Kỹ Thuật
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <table className="table-auto border-collapse w-full">
            <tbody>
              {specifications.slice(0, previewCount).map((spec, index) => (
                <tr
                  key={index}
                  className={index > 0 ? "border-t border-gray-200" : ""}
                >
                  <td className="py-2 pr-4 text-gray-600 font-medium w-1/3">
                    {spec.key}
                  </td>
                  <td className="py-2 text-gray-800 w-2/3">
                    {Array.isArray(spec.value) ? (
                      <ul className="list-disc list-inside">
                        {spec.value.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      spec.value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasMore && (
            <div className="flex justify-center mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
              >
                Xem đầy đủ thông số kỹ thuật ({specifications.length} thông số)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for full specifications - Bigger but keep original table layout */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Sticky Header với nút đóng */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Thông Số Kỹ Thuật Đầy Đủ
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                title="Đóng"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable Content - Table layout như cũ */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <table className="table-auto border-collapse w-full">
                <tbody>
                  {specifications.map((spec, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="py-3 pr-4 text-gray-600 font-medium align-top w-1/3">
                        {spec.key}
                      </td>
                      <td className="py-3 text-gray-800 w-2/3">
                        {Array.isArray(spec.value) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {spec.value.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          spec.value
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductSpecifications;
