"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets"; // Xóa productsDummyData nếu không dùng
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const ProductList = () => {
  const { router, getToken, user, deleteProduct } = useAppContext(); // Thêm deleteProduct

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/product/seller-list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", data);

      if (data.success) {
        setProducts(data.product || []);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch Product Error:", error);
      toast.error(error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(productId); // Gọi hàm deleteProduct từ context
      fetchSellerProduct(); // Cập nhật danh sách sau khi xóa
    }
  };

  useEffect(() => {
    if (user && getToken) {
      fetchSellerProduct();
    }
  }, [user, getToken]);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">Tất Cả Sản Phẩm</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 text-sm text-left">
                <tr>
                  <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">
                    Sản Phẩm 
                  </th>
                  <th className="px-4 py-3 font-medium truncate max-sm:hidden">
                    Loại
                  </th>
                  <th className="px-4 py-3 font-medium truncate">Giá tiền</th>
                  <th className="px-4 py-3 font-medium truncate max-sm:hidden">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {products && products.length > 0 ? (
                  products.map((product, index) => (
                    <tr key={index} className="border-t border-gray-500/20">
                      <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                        <div className="bg-gray-500/10 rounded p-2">
                          <Image
                            src={product.image?.[0] || assets.placeholder_image}
                            alt="Product Image"
                            className="w-16"
                            width={1280}
                            height={720}
                          />
                        </div>
                        <span className="truncate w-full">{product.name}</span>
                      </td>
                      <td className="px-4 py-3 max-sm:hidden">
                        {product.category}
                      </td>
                      <td className="px-4 py-3">${product.offerPrice}</td>
                      <td className="px-4 py-3 max-sm:hidden">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (product._id) {
                                router.push(`/product/${product._id}`);
                              } else {
                                console.error(
                                  "Error: product._id is undefined",
                                  product
                                );
                                toast.error("Product ID not found!");
                              }
                            }}
                            className="flex items-center gap-1 px-1.5 md:px-3.5 py-2 bg-orange-600 text-white rounded-md"
                          >
                            <span className="hidden md:block">Xem</span>
                            <Image
                              className="h-3.5"
                              src={assets.redirect_icon}
                              alt="redirect_icon"
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="flex items-center gap-1 px-1.5 md:px-3.5 py-2 bg-red-600 text-white rounded-md"
                          >
                            <span className="hidden md:block">Xóa</span>
                            {/* <Image
                              className="h-3.5"
                              src={assets.delete_icon} // Giả định bạn có icon delete trong assets
                              alt="delete_icon"
                            /> */}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      Không Tìm Thấy Sản Phẩm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* <Footer /> */}
    </div>
  );
};

export default ProductList;
