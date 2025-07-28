"use client";
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const AddProduct = () => {
  const { getToken } = useAppContext();

  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [keywords, setKeywords] = useState(""); // Giữ state cho keywords
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erroName, setErroName] = useState("");

  // Tải danh sách categories và brands từ API
  const fetchCategoriesAndBrands = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        return;
      }

      const [catRes, brandRes] = await Promise.all([
        axios.get("/api/seller/manage", {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: "categories" },
        }),
        axios.get("/api/seller/manage", {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: "brands" },
        }),
      ]);

      if (catRes.data.success) {
        setCategories(catRes.data.items);
        if (catRes.data.items.length > 0) {
          setCategory(catRes.data.items[0].name); // Đặt giá trị mặc định là category đầu tiên
        }
      }
      if (brandRes.data.success) {
        setBrands(brandRes.data.items);
        if (brandRes.data.items.length > 0) {
          setBrand(brandRes.data.items[0].name); // Đặt giá trị mặc định là brand đầu tiên
        }
      }
    } catch (error) {
      console.error("Fetch Categories/Brands Error:", error.response?.data);
      toast.error(
        "Lỗi khi tải danh sách loại và hãng: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndBrands();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken();
      const res = await axios.get("/api/product/list", {
        headers: { Authorization: `Bearer ${token}` },
        params: { name },
      });

      if (res.data.success) {
        const products = res.data.products || [];
        const isDuplicateName = products.some(
          (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
        );

        if (isDuplicateName) {
          setErroName("Tên sản phẩm bị trùng , vui lòng nhập lại");
          toast.error("Tên sản phẩm bị trùng , vui lòng nhập lại");
          return;
        } else {
          setErroName("");
        }
      }
    } catch (error) {
      console.error("lỗi kiểm tra sản phẩm ", error);
      toast.error("Không thể kiểm tra sản phẩm ,vui lòng thử lại");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("brand", brand);
    // Chuyển keywords thành mảng (cách nhau bởi dấu phẩy hoặc khoảng trắng)
    const keywordArray = keywords
      .split(/[, ]+/)
      .filter((keyword) => keyword.trim())
      .map((keyword) => keyword.trim());
    formData.append("keywords", JSON.stringify(keywordArray)); // Gửi dưới dạng JSON

    for (let i = 0; i < files.length; i++) {
      if (files[i]) formData.append("images", files[i]);
    }

    try {
      const token = await getToken();
      const { data } = await axios.post("/api/product/add", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message);
        setFiles([]);
        setName("");
        setDescription("");
        setKeywords(""); // Reset keywords
        if (categories.length > 0) setCategory(categories[0].name); // Reset về category đầu tiên
        if (brands.length > 0) setBrand(brands[0].name); // Reset về brand đầu tiên
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Add Product Error:", error.response?.data);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
              <p className="text-gray-600 font-medium">
                Đang tải danh sách loại và hãng...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Thêm Sản Phẩm Mới
              </h1>
              <p className="text-gray-600">
                Điền thông tin chi tiết để thêm sản phẩm vào cửa hàng của bạn
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-xl p-8 space-y-8"
            >
              {/* Upload Images Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Hình Ảnh Sản Phẩm
                    </h3>
                    <p className="text-sm text-gray-600">
                      Tải lên tối đa 4 hình ảnh chất lượng cao
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, index) => (
                    <label
                      key={index}
                      htmlFor={`image${index}`}
                      className="group"
                    >
                      <input
                        onChange={(e) => {
                          const updatedFiles = [...files];
                          updatedFiles[index] = e.target.files[0];
                          setFiles(updatedFiles);
                        }}
                        type="file"
                        id={`image${index}`}
                        hidden
                        accept="image/*"
                      />
                      <div className="relative aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all duration-300 cursor-pointer group-hover:bg-blue-50 flex items-center justify-center overflow-hidden">
                        {files[index] ? (
                          <Image
                            className="w-full h-full object-cover"
                            src={URL.createObjectURL(files[index])}
                            alt={`Product image ${index + 1}`}
                            width={200}
                            height={200}
                          />
                        ) : (
                          <div className="text-center">
                            <Image
                              className="w-12 h-12 mx-auto opacity-50"
                              src={assets.upload_area}
                              alt="Upload"
                              width={48}
                              height={48}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Tải ảnh {index + 1}
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label
                    className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3"
                    htmlFor="product-name"
                  >
                    <span className="text-xl"></span>
                    Tên Sản Phẩm
                  </label>
                  {erroName && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <span></span>
                        {erroName}
                      </p>
                    </div>
                  )}
                  <input
                    id="product-name"
                    type="text"
                    placeholder="Nhập tên sản phẩm (ví dụ: iPhone 15 Pro Max 256GB)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 text-gray-700"
                    onChange={(e) => {
                      setName(e.target.value);
                      setErroName("");
                    }}
                    value={name}
                    required
                  />
                </div>

                {/* Category & Brand */}
                <div>
                  <label
                    className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3"
                    htmlFor="category"
                  >
                    <span className="text-xl"></span>
                    Danh Mục
                  </label>
                  <select
                    id="category"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 bg-white text-gray-700"
                    onChange={(e) => setCategory(e.target.value)}
                    value={category}
                    disabled={categories.length === 0}
                  >
                    {categories.length === 0 ? (
                      <option value="">Không có danh mục nào</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label
                    className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3"
                    htmlFor="brand"
                  >
                    <span className="text-xl"></span>
                    Thương Hiệu
                  </label>
                  <select
                    id="brand"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 bg-white text-gray-700"
                    onChange={(e) => setBrand(e.target.value)}
                    value={brand}
                    disabled={brands.length === 0}
                  >
                    {brands.length === 0 ? (
                      <option value="">Không có thương hiệu nào</option>
                    ) : (
                      brands.map((br) => (
                        <option key={br._id} value={br.name}>
                          {br.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Product Description */}
              <div>
                <label
                  className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3"
                  htmlFor="product-description"
                >
                  <span className="text-xl"></span>
                  Mô Tả Sản Phẩm
                </label>
                <textarea
                  id="product-description"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 resize-none text-gray-700"
                  placeholder="Mô tả chi tiết về sản phẩm, tính năng nổi bật, chất liệu, kích thước..."
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                  required
                />
              </div>

              {/* Keywords */}
              <div>
                <label
                  className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3"
                  htmlFor="keywords"
                >
                  <span className="text-xl"></span>
                  Từ Khóa Tìm Kiếm
                </label>
                <input
                  id="keywords"
                  type="text"
                  placeholder="smartphone, 5G, chống nước, camera 48MP"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 text-gray-700"
                  onChange={(e) => setKeywords(e.target.value)}
                  value={keywords}
                />
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700 flex items-center gap-2">
                    <span></span>
                    Nhập các từ khóa giúp khách hàng tìm thấy sản phẩm dễ dàng
                    hơn, cách nhau bằng dấu phẩy
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
                >
                  <span className="text-lg"></span>
                  THÊM SẢN PHẨM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
