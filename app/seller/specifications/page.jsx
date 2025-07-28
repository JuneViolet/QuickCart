"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import AddSpecification from "./AddSpecification";
import EditSpecification from "./EditSpecification";
import { useRouter } from "next/navigation";

const ManageSpecifications = () => {
  const router = useRouter();
  const [specifications, setSpecifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [editingSpec, setEditingSpec] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/list");
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      setError("Lỗi khi tải danh mục: " + error.message);
    }
  };

  const fetchProducts = async (categoryId, pageNum = 1) => {
    if (categoryId) {
      try {
        const { data } = await axios.get(
          `/api/product/list?categoryId=${categoryId}&page=${pageNum}&limit=50`
        );
        console.log("Products fetched for categoryId", categoryId, data);
        if (data.success) {
          setProducts(data.products);
          setSelectedProduct("");
          if (data.totalProducts > data.limit * pageNum) {
            // Nếu còn sản phẩm, có thể thêm logic lấy trang tiếp theo
          }
        } else {
          setError(data.message || "Không tìm thấy sản phẩm.");
          setProducts([]);
        }
      } catch (error) {
        setError("Lỗi khi tải sản phẩm: " + error.message);
        setProducts([]);
        console.error("Fetch Products Error:", error);
      }
    } else {
      setProducts([]);
    }
  };

  const fetchSpecs = async (productId) => {
    if (productId) {
      try {
        const response = await axios.get(`/api/specification/${productId}`, {
          headers: { "Content-Type": "application/json" },
          validateStatus: (status) => status >= 200 && status < 500,
        });
        const data = response.data;
        if (data.success) {
          setSpecifications(data.specifications);
          setError("");
        } else {
          setSpecifications([]);
          setError(data.message || "Không tìm thấy thông số.");
        }
      } catch (error) {
        console.error("Fetch Specs Error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setSpecifications([]);
        setError(
          "Lỗi khi tải thông số: " + (error.message || "Không xác định")
        );
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    if (selectedCategory) {
      fetchProducts(selectedCategory, 1);
    } else {
      setProducts([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedProduct) {
      fetchSpecs(selectedProduct);
    } else {
      setSpecifications([]);
    }
  }, [selectedProduct]);

  const handleAddSpec = () => {
    if (!selectedProduct || !selectedCategory) {
      setError("Vui lòng chọn danh mục và sản phẩm trước khi thêm thông số.");
      return;
    }
    setShowAddForm(true);
    setError("");
    setEditingSpec(null);
  };

  const handleSpecAdded = () => {
    setShowAddForm(false);
    setEditingSpec(null);
    if (selectedProduct) {
      fetchSpecs(selectedProduct);
    }
  };

  const handleEditSpec = (spec) => {
    setEditingSpec(spec);
    setShowAddForm(true);
  };

  const handleDeleteSpec = async (specId) => {
    if (confirm("Bạn có chắc chắn muốn xóa thông số này?")) {
      try {
        const response = await axios.delete(
          `/api/specification/${selectedProduct}`,
          {
            data: { specId },
          }
        );
        if (response.data.success) {
          fetchSpecs(selectedProduct);
        } else {
          alert("Xóa thất bại: " + response.data.message);
        }
      } catch (error) {
        console.error("Delete Error:", error.response?.data || error.message);
        alert("Lỗi khi xóa thông số: " + error.message);
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Quản Lý Thông Số Kỹ Thuật
        </h1>
        <p className="text-gray-600">
          Thêm, sửa, xóa thông số kỹ thuật cho các sản phẩm
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Danh Mục
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Sản Phẩm
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              disabled={!selectedCategory}
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((prod) => (
                <option key={prod._id} value={prod._id}>
                  {prod.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={handleAddSpec}
              className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={!selectedProduct}
            >
              <span>➕</span>
              Thêm Thông Số
            </button>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">
            Danh Sách Thông Số
            {selectedProduct && (
              <span className="text-sm text-gray-500 ml-2">
                ({specifications.length} thông số)
              </span>
            )}
          </h3>
        </div>

        {specifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên Thông Số
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá Trị
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {specifications.map((spec, index) => (
                  <tr
                    key={spec._id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {spec.key}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {Array.isArray(spec.value) ? (
                        <div className="flex flex-wrap gap-1">
                          {spec.value.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-900">{spec.value}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSpec(spec)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 transition-colors"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteSpec(spec._id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có thông số nào
            </h3>
            <p className="text-gray-500">
              {selectedProduct
                ? "Nhấn 'Thêm Thông Số' để thêm thông số đầu tiên"
                : "Vui lòng chọn danh mục và sản phẩm để xem thông số"}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <AddSpecification
          productId={selectedProduct}
          categoryId={selectedCategory}
          editingSpec={editingSpec}
          onClose={handleSpecAdded}
        />
      )}

      {showAddForm && editingSpec && (
        <EditSpecification
          productId={selectedProduct}
          categoryId={selectedCategory}
          editingSpec={editingSpec}
          onClose={handleSpecAdded}
        />
      )}
    </div>
  );
};

export default ManageSpecifications;
