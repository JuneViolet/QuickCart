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
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <p className="p-4">Đang tải danh sách loại và hãng...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="md:p-10 p-4 space-y-5 max-w-lg"
        >
          <div>
            <p className="text-base font-medium">Hình Ảnh Sản Phẩm</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {[...Array(4)].map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input
                    onChange={(e) => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }}
                    type="file"
                    id={`image${index}`}
                    hidden
                  />
                  <Image
                    className="max-w-24 cursor-pointer"
                    src={
                      files[index]
                        ? URL.createObjectURL(files[index])
                        : assets.upload_area
                    }
                    alt=""
                    width={100}
                    height={100}
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-base font-medium" htmlFor="product-name">
              Tên Sản Phẩm
            </label>
            {erroName && <p className="text-sm text-red-500">{erroName}</p>}
            <input
              id="product-name"
              type="text"
              placeholder="Type here"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => {
                setName(e.target.value);
                setErroName("");
              }}
              value={name}
              required
            />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <label
              className="text-base font-medium"
              htmlFor="product-description"
            >
              Chi Tiết Sản Phẩm
            </label>
            <textarea
              id="product-description"
              rows={4}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
              placeholder="Nhập mô tả chi tiết sản phẩm (ví dụ: Tai nghe không dây, pin 20 giờ...)"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            ></textarea>
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex flex-col gap-1 w-32">
              <label className="text-base font-medium" htmlFor="category">
                Loại
              </label>
              <select
                id="category"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
                disabled={categories.length === 0}
              >
                {categories.length === 0 ? (
                  <option value="">Không có loại nào</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex flex-col gap-1 w-32">
              <label className="text-base font-medium" htmlFor="brand">
                Hãng
              </label>
              <select
                id="brand"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                onChange={(e) => setBrand(e.target.value)}
                value={brand}
                disabled={brands.length === 0}
              >
                {brands.length === 0 ? (
                  <option value="">Không có hãng nào</option>
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
          {/* Thêm trường keywords */}
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-base font-medium" htmlFor="keywords">
              Từ Khóa (cách nhau bằng dấu phẩy)
            </label>
            <input
              id="keywords"
              type="text"
              placeholder="Ví dụ: Apple, smartphone, 5G"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setKeywords(e.target.value)}
              value={keywords}
            />
            <p className="text-sm text-gray-500">
              Nhập các từ khóa liên quan (ví dụ: thương hiệu, tính năng), cách
              nhau bằng dấu phẩy hoặc khoảng trắng.
            </p>
          </div>
          <button
            type="submit"
            className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded"
          >
            THÊM
          </button>
        </form>
      )}
    </div>
  );
};

export default AddProduct;
