"use client";

import React, { useState } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

const ProductSpecifications = ({ specifications }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!specifications || specifications.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-6">
        <h2 className="text-xl font-semibold flex justify-center">
          Thông Số Kỹ Thuật
        </h2>
        <table className="table-auto border-collapse w-full mt-2">
          <tbody>
            {specifications
              .slice(0, Math.ceil(specifications.length / 2))
              .map((spec, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2 text-gray-600 font-medium">{spec.key}</td>
                  <td className="p-2 text-gray-800/50">
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
        {specifications.length > 2 && (
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Xem đầy đủ thông số kỹ thuật
            </button>
          </div>
        )}
      </div>

      {/* Modal for full specifications */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Thông Số Kỹ Thuật</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Image src={assets.x_icon} alt="close" className="w-6 h-6" />
              </button>
            </div>
            <table className="table-auto border-collapse w-full">
              <tbody>
                {specifications.map((spec, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2 text-gray-600 font-medium">
                      {spec.key}
                    </td>
                    <td className="p-2 text-gray-800/50">
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
          </div>
        </div>
      )}
    </>
  );
};

export default ProductSpecifications;
