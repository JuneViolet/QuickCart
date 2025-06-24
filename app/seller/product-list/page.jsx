"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const ProductList = () => {
  const { router, getToken, user, deleteProduct, formatCurrency } =
    useAppContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryName: "",
    price: "",
    offerPrice: "",
    // stock: "",
    brandName: "",
  });
  const [variants, setVariants] = useState({}); // Lưu biến thể theo productId
  const [isAddingVariant, setIsAddingVariant] = useState(null); // ProductId đang thêm biến thể
  const [newVariantData, setNewVariantData] = useState({
    productId: "",
    attributeRefs: [],
    price: 0,
    offerPrice: 0,
    stock: "",
    sku: "",
    image: "",
  });
  const [attributes, setAttributes] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null); // Thêm state cho popup
  const [productStocks, setProductStocks] = useState({});
  const [editingVariant, setEditingVariant] = useState(null); // Lưu biến thể đang chỉnh sửa
  const [editVariantData, setEditVariantData] = useState({
    attributeRefs: [],
    price: 0,
    offerPrice: 0,
    stock: "",
    sku: "",
    image: "",
  });
  // Fetch products
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

  // Fetch categories and brands
  const fetchCategoriesAndBrands = async () => {
    try {
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
      if (catRes.data.success) setCategories(catRes.data.items);
      if (brandRes.data.success) setBrands(brandRes.data.items);
    } catch (error) {
      console.error("Fetch Categories/Brands Error:", error.response?.data);
      toast.error(
        "Lỗi khi tải danh sách loại và hãng: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Fetch attributes
  const fetchAttributes = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/attributes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setAttributes(data.attributes || []);
    } catch (error) {
      console.error("Fetch Attributes Error:", error);
      toast.error("Lỗi khi tải thuộc tính: " + error.message);
    }
  };

  // Fetch variants for all products
  const fetchSellerVariants = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/variants/manage", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Raw Variants Data from API:", data.variants); // Debug
      if (data.success) {
        const variantMap = data.variants.reduce((acc, variant) => {
          if (!acc[variant.productId._id]) acc[variant.productId._id] = [];
          acc[variant.productId._id].push(variant);
          return acc;
        }, {});
        console.log("Mapped Variants:", variantMap); // Debug
        setVariants(variantMap);
      } else {
        toast.error(data.message || "Không thể tải biến thể");
      }
    } catch (error) {
      console.error("Fetch Variants Error:", error);
      toast.error("Lỗi server: " + error.message);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(productId);
      fetchSellerProduct();
    }
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    if (!product._id) {
      toast.error("Product ID is missing");
      return;
    }
    setEditingProduct(product._id);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      categoryName: product.category?.name || "",
      price: product.price !== undefined ? product.price : "",
      offerPrice: product.offerPrice !== undefined ? product.offerPrice : "",
      brandName: product.brand?.name || "Unknown",
    });
  };

  // Handle update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) {
      toast.error("No product selected for update");
      return;
    }
    try {
      const token = await getToken();
      const category = categories.find(
        (cat) => cat.name === formData.categoryName
      );
      const brand = brands.find((br) => br.name === formData.brandName);

      const updatedData = {
        name: formData.name,
        description: formData.description,
        categoryName: formData.categoryName,
        price: formData.price || "0",
        offerPrice: formData.offerPrice || "0",
        stock: 0, // Số nguyên
        brandName: formData.brandName,
      };

      console.log("Sending data:", updatedData); // Debug
      const response = await axios.put(
        `/api/product/update/${editingProduct}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setEditingProduct(null);
        fetchSellerProduct();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(
        "Update Product Error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      categoryName: "",
      price: "",
      offerPrice: "",
      brandName: "",
    });
  };

  // Handle add variant
  const handleAddAttributeRef = (attributeId, value) => {
    setNewVariantData((prev) => {
      const updatedRefs = prev.attributeRefs.filter(
        (ref) => ref.attributeId !== attributeId
      );
      if (value)
        return {
          ...prev,
          attributeRefs: [...updatedRefs, { attributeId, value }],
        };
      return { ...prev, attributeRefs: updatedRefs };
    });
  };

  const handleAddVariant = async (e, productId) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const productResponse = await axios.get(`/api/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const product = productResponse.data.product;
      if (!product) throw new Error("Sản phẩm không tồn tại");

      const variantData = {
        ...newVariantData,
        productId,
        price: newVariantData.price || product.price || 0,
        offerPrice: newVariantData.offerPrice || product.offerPrice || 0,
      };
      const { data } = await axios.post("/api/variants/manage", variantData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(data.message);
        setIsAddingVariant(null);
        setNewVariantData({
          productId: "",
          attributeRefs: [],
          price: 0,
          offerPrice: 0,
          stock: "",
          sku: "",
          image: "",
        });
        // Làm mới danh sách biến thể
        await fetchSellerVariants();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(
        "Add Variant Error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant._id);
    setEditVariantData({
      attributeRefs: variant.attributeRefs.map((ref) => ({ ...ref })),
      price: variant.price,
      offerPrice: variant.offerPrice,
      stock: variant.stock,
      sku: variant.sku,
      image: variant.image || "",
    });
  };
  const handleEditAttributeRef = (attributeId, value) => {
    setEditVariantData((prev) => {
      const updatedRefs = prev.attributeRefs.filter(
        (ref) => ref.attributeId !== attributeId
      );
      if (value)
        return {
          ...prev,
          attributeRefs: [...updatedRefs, { attributeId, value }],
        };
      return { ...prev, attributeRefs: updatedRefs };
    });
  };

  const handleUpdateVariant = async (e, variantId) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const { data } = await axios.put(
        `/api/variants/manage/${variantId}`,
        editVariantData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        setEditingVariant(null); // Đóng form chỉnh sửa
        fetchSellerVariants(); // Làm mới danh sách biến thể
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(
        "Update Variant Error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật biến thể");
    }
  };
  // Handle delete variant
  const handleDeleteVariant = async (variantId) => {
    if (confirm("Bạn có chắc chắn muốn xóa biến thể này?")) {
      try {
        const token = await getToken();
        const { data } = await axios.delete(
          `/api/variants/manage/${variantId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (data.success) {
          toast.success(data.message);
          fetchSellerVariants();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error(
          "Delete Variant Error:",
          error.response?.data || error.message
        );
        toast.error(error.response?.data?.message || "Lỗi khi xóa biến thể");
      }
    }
  };

  useEffect(() => {
    if (user && getToken) {
      const fetchData = async () => {
        await Promise.all([
          fetchSellerProduct(),
          fetchCategoriesAndBrands(),
          fetchAttributes(),
          fetchSellerVariants(),
        ]);
      };
      fetchData();
    }
  }, [user, getToken]);

  useEffect(() => {
    const newStocks = {};
    products.forEach((product) => {
      const variantStock =
        variants[product._id]?.reduce(
          (sum, variant) => sum + (variant.stock || 0),
          0
        ) || 0;
      newStocks[product._id] = variantStock;
    });
    setProductStocks(newStocks);
  }, [variants, products]);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">Tất Cả Sản Phẩm</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-600/20">
            <div className="hidden sm:block w-full">
              <div className="max-h-96 overflow-y-auto border border-gray-600/20 rounded-md">
                <table className="table-fixed w-full">
                  <thead className="text-gray-900 text-sm text-left bg-gray-100 sticky top-0">
                    <tr>
                      <th className="w-48 px-4 py-3 font-medium truncate">
                        Sản Phẩm
                      </th>
                      <th className="w-24 px-4 py-3 font-medium truncate">
                        Loại
                      </th>
                      <th className="w-24 px-4 py-3 font-medium truncate">
                        Hãng
                      </th>
                      <th className="w-24 px-4 py-3 font-medium truncate">
                        Số Lượng
                      </th>
                      <th className="w-28 px-4 py-3 font-medium truncate">
                        Giá tiền
                      </th>
                      <th className="w-32 px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-500">
                    {products.map((product, index) => (
                      <React.Fragment key={index}>
                        <tr className="border-t border-gray-500/20">
                          <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                            <div className="bg-gray-500/10 rounded p-2">
                              <Image
                                src={
                                  product.images?.[0] ||
                                  assets.placeholder_image
                                }
                                alt="Product Image"
                                className="w-full h-full object-cover rounded"
                                width={64}
                                height={64}
                              />
                            </div>
                            <span className="truncate w-full">
                              {product.name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {product.category?.name || "Unknown"}
                          </td>
                          <td className="px-4 py-3">
                            {product.brand?.name || "Unknown"}
                          </td>
                          <td className="px-4 py-3">
                            {productStocks[product._id] !== undefined
                              ? productStocks[product._id]
                              : "0"}
                          </td>
                          <td className="px-4 py-3">
                            {formatCurrency(product.offerPrice)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button
                                  key={`view-${product._id}`}
                                  onClick={() =>
                                    router.push(`/product/${product._id}`)
                                  }
                                  className="flex items-center gap-1 px-2 py-1 bg-orange-600 text-white rounded-md text-sm"
                                  title="Xem"
                                >
                                  <span className="w-4 h-4 flex items-center">
                                    <Image
                                      src={assets.view}
                                      alt="View"
                                      className="w-full h-full object-contain"
                                      width={16}
                                      height={16}
                                    />
                                  </span>
                                </button>
                                <button
                                  key={`edit-${product._id}`}
                                  onClick={() => handleEditProduct(product)}
                                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
                                  title="Sửa"
                                >
                                  <span className="w-4 h-4 flex items-center">
                                    <Image
                                      src={assets.fix}
                                      alt="Edit"
                                      className="w-full h-full object-contain"
                                      width={16}
                                      height={16}
                                    />
                                  </span>
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  key={`delete-${product._id}`}
                                  onClick={() =>
                                    handleDeleteProduct(product._id)
                                  }
                                  className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                                  title="Xóa"
                                >
                                  <span className="w-4 h-4 flex items-center">
                                    <Image
                                      src={assets.deleted}
                                      alt="Delete"
                                      className="w-full h-full object-contain"
                                      width={16}
                                      height={16}
                                    />
                                  </span>
                                </button>
                                <button
                                  key={`variant-${product._id}`}
                                  onClick={() =>
                                    setIsAddingVariant(product._id)
                                  }
                                  className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md text-sm"
                                  title="Thêm Biến Thể"
                                >
                                  <span className="w-4 h-4 flex items-center">
                                    <Image
                                      src={assets.variant}
                                      alt="Add Variant"
                                      className="w-full h-full object-contain"
                                      width={16}
                                      height={16}
                                    />
                                  </span>
                                </button>
                                <button
                                  key={`view-variants-${product._id}`}
                                  onClick={() => {
                                    console.log(
                                      "Opening variants for:",
                                      product._id
                                    );
                                    setSelectedProductId(product._id);
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-md text-sm"
                                  title="Xem Biến Thể"
                                >
                                  <span className="w-4 h-4 flex items-center">
                                    <Image
                                      src={assets.variant}
                                      alt="View Variants"
                                      className="w-full h-full object-contain"
                                      width={16}
                                      height={16}
                                    />
                                  </span>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                        {isAddingVariant === product._id && (
                          <tr>
                            <td colSpan="6" className="p-4 bg-gray-50">
                              <form
                                onSubmit={(e) =>
                                  handleAddVariant(e, product._id)
                                }
                                className="space-y-4"
                              >
                                <div className="flex flex-col gap-1">
                                  <label className="text-base font-medium">
                                    Thuộc Tính
                                  </label>
                                  {attributes.map((attr) => (
                                    <div key={attr._id} className="mb-2">
                                      <select
                                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 w-full"
                                        onChange={(e) =>
                                          handleAddAttributeRef(
                                            attr._id,
                                            e.target.value
                                          )
                                        }
                                        value={
                                          newVariantData.attributeRefs.find(
                                            (ref) =>
                                              ref.attributeId === attr._id
                                          )?.value || ""
                                        }
                                      >
                                        <option value="">
                                          Chọn {attr.name}
                                        </option>
                                        {attr.values.map((value) => (
                                          <option key={value} value={value}>
                                            {value}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-5 flex-wrap">
                                  <div className="flex flex-col gap-1 w-32">
                                    <label
                                      className="text-base font-medium"
                                      htmlFor="new-price"
                                    >
                                      Giá Gốc
                                    </label>
                                    <input
                                      id="new-price"
                                      type="number"
                                      placeholder="0"
                                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                      value={newVariantData.price}
                                      onChange={(e) =>
                                        setNewVariantData({
                                          ...newVariantData,
                                          price: e.target.value,
                                        })
                                      }
                                      required
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1 w-32">
                                    <label
                                      className="text-base font-medium"
                                      htmlFor="new-offerPrice"
                                    >
                                      Giá Khuyến Mãi
                                    </label>
                                    <input
                                      id="new-offerPrice"
                                      type="number"
                                      placeholder="0"
                                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                      value={newVariantData.offerPrice}
                                      onChange={(e) =>
                                        setNewVariantData({
                                          ...newVariantData,
                                          offerPrice: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1 w-32">
                                    <label
                                      className="text-base font-medium"
                                      htmlFor="new-stock"
                                    >
                                      Số Lượng
                                    </label>
                                    <input
                                      id="new-stock"
                                      type="number"
                                      placeholder="0"
                                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                      value={newVariantData.stock}
                                      onChange={(e) =>
                                        setNewVariantData({
                                          ...newVariantData,
                                          stock: e.target.value,
                                        })
                                      }
                                      required
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1 w-32">
                                    <label
                                      className="text-base font-medium"
                                      htmlFor="new-sku"
                                    >
                                      SKU
                                    </label>
                                    <input
                                      id="new-sku"
                                      type="text"
                                      placeholder="Nhập SKU"
                                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                      value={newVariantData.sku}
                                      onChange={(e) =>
                                        setNewVariantData({
                                          ...newVariantData,
                                          sku: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1 w-32">
                                    <label
                                      className="text-base font-medium"
                                      htmlFor="new-image"
                                    >
                                      URL Hình Ảnh
                                    </label>
                                    <input
                                      id="new-image"
                                      type="text"
                                      placeholder="Nhập URL ảnh"
                                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                      value={newVariantData.image}
                                      onChange={(e) =>
                                        setNewVariantData({
                                          ...newVariantData,
                                          image: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded"
                                  >
                                    Thêm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setIsAddingVariant(null)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="block sm:hidden w-full">
              <div className="max-h-96 overflow-y-auto border border-gray-600/20 rounded-md">
                {products.map((product, index) => (
                  <React.Fragment key={index}>
                    <div className="border-b border-gray-500/20 p-4 flex flex-col gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-500/10 rounded p-2">
                          <Image
                            src={
                              product.images?.[0] || assets.placeholder_image
                            }
                            alt="Product Image"
                            className="w-16"
                            width={1280}
                            height={720}
                          />
                        </div>
                        <span className="truncate text-sm font-medium">
                          {product.name}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Loại: </span>
                          {product.category?.name || "Unknown"}
                        </div>
                        <div>
                          <span className="font-medium">Hãng: </span>
                          {product.brand?.name || "Unknown"}
                        </div>
                        <div>
                          <span className="font-medium">Số Lượng: </span>
                          {productStocks[product._id] !== undefined
                            ? productStocks[product._id]
                            : "0"}
                        </div>
                        <div>
                          <span className="font-medium">Giá tiền: </span>
                          {formatCurrency(product.offerPrice)}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => router.push(`/product/${product._id}`)}
                          className="flex items-center gap-1 px-2 py-1 bg-orange-600 text-white rounded-md text-sm"
                        >
                          <span>Xem</span>
                          <Image
                            className="h-3.5"
                            src={assets.redirect_icon}
                            alt="redirect_icon"
                          />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
                        >
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                        >
                          <span>Xóa</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingVariant(product._id);
                            setNewVariantData((prev) => ({
                              ...prev,
                              productId: product._id,
                            }));
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md text-sm"
                        >
                          <span>Thêm Biến Thể</span>
                        </button>
                        <button
                          onClick={() => {
                            console.log("Opening variants for:", product._id);
                            setSelectedProductId(product._id);
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-md text-sm"
                          title="Xem Biến Thể"
                        >
                          <span>Xem Biến Thể</span>
                        </button>
                      </div>
                    </div>
                    {isAddingVariant === product._id && (
                      <div className="p-4 bg-gray-50">
                        <form
                          onSubmit={(e) => handleAddVariant(e, product._id)}
                          className="space-y-4"
                        >
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium">
                              Thuộc Tính
                            </label>
                            {attributes.map((attr) => (
                              <div key={attr._id} className="mb-2">
                                <select
                                  className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 w-full"
                                  onChange={(e) =>
                                    handleAddAttributeRef(
                                      attr._id,
                                      e.target.value
                                    )
                                  }
                                  value={
                                    newVariantData.attributeRefs.find(
                                      (ref) => ref.attributeId === attr._id
                                    )?.value || ""
                                  }
                                >
                                  <option value="">Chọn {attr.name}</option>
                                  {attr.values.map((value) => (
                                    <option key={value} value={value}>
                                      {value}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-5 flex-wrap">
                            <div className="flex flex-col gap-1 w-32">
                              <label
                                className="text-base font-medium"
                                htmlFor="new-price"
                              >
                                Giá Gốc
                              </label>
                              <input
                                id="new-price"
                                type="number"
                                placeholder="0"
                                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                value={newVariantData.price}
                                onChange={(e) =>
                                  setNewVariantData({
                                    ...newVariantData,
                                    price: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1 w-32">
                              <label
                                className="text-base font-medium"
                                htmlFor="new-offerPrice"
                              >
                                Giá Khuyến Mãi
                              </label>
                              <input
                                id="new-offerPrice"
                                type="number"
                                placeholder="0"
                                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                value={newVariantData.offerPrice}
                                onChange={(e) =>
                                  setNewVariantData({
                                    ...newVariantData,
                                    offerPrice: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="flex flex-col gap-1 w-32">
                              <label
                                className="text-base font-medium"
                                htmlFor="new-stock"
                              >
                                Số Lượng
                              </label>
                              <input
                                id="new-stock"
                                type="number"
                                placeholder="0"
                                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                value={newVariantData.stock}
                                onChange={(e) =>
                                  setNewVariantData({
                                    ...newVariantData,
                                    stock: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1 w-32">
                              <label
                                className="text-base font-medium"
                                htmlFor="new-sku"
                              >
                                SKU
                              </label>
                              <input
                                id="new-sku"
                                type="text"
                                placeholder="Nhập SKU"
                                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                value={newVariantData.sku}
                                onChange={(e) =>
                                  setNewVariantData({
                                    ...newVariantData,
                                    sku: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="flex flex-col gap-1 w-32">
                              <label
                                className="text-base font-medium"
                                htmlFor="new-image"
                              >
                                URL Hình Ảnh
                              </label>
                              <input
                                id="new-image"
                                type="text"
                                placeholder="Nhập URL ảnh"
                                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                value={newVariantData.image}
                                onChange={(e) =>
                                  setNewVariantData({
                                    ...newVariantData,
                                    image: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="submit"
                              className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                              Thêm
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAddingVariant(null)}
                              className="px-4 py-2 bg-gray-500 text-white rounded"
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {selectedProductId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h3 className="text-lg font-medium mb-4">
                    Biến Thể của{" "}
                    {products.find((p) => p._id === selectedProductId)?.name ||
                      "Sản phẩm"}
                  </h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {variants[selectedProductId] &&
                    variants[selectedProductId].length > 0 ? (
                      variants[selectedProductId].map((variant) => (
                        <div key={variant._id} className="border-b py-2">
                          {editingVariant === variant._id ? (
                            // FORM CHỈNH SỬA BIẾN THỂ
                            <form
                              onSubmit={(e) =>
                                handleUpdateVariant(e, variant._id)
                              }
                              className="space-y-3"
                            >
                              <div className="flex flex-col gap-1">
                                <label className="text-base font-medium">
                                  Thuộc Tính
                                </label>
                                {attributes.map((attr) => (
                                  <div key={attr._id} className="mb-2">
                                    <select
                                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 w-full"
                                      onChange={(e) =>
                                        handleEditAttributeRef(
                                          attr._id,
                                          e.target.value
                                        )
                                      }
                                      value={
                                        editVariantData.attributeRefs.find(
                                          (ref) => ref.attributeId === attr._id
                                        )?.value || ""
                                      }
                                    >
                                      <option value="">Chọn {attr.name}</option>
                                      {attr.values.map((value) => (
                                        <option key={value} value={value}>
                                          {value}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-5 flex-wrap">
                                <div className="flex flex-col gap-1 w-32">
                                  <label className="text-base font-medium">
                                    Giá Gốc
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                    value={editVariantData.price}
                                    onChange={(e) =>
                                      setEditVariantData({
                                        ...editVariantData,
                                        price: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <div className="flex flex-col gap-1 w-32">
                                  <label className="text-base font-medium">
                                    Giá Khuyến Mãi
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                    value={editVariantData.offerPrice}
                                    onChange={(e) =>
                                      setEditVariantData({
                                        ...editVariantData,
                                        offerPrice: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="flex flex-col gap-1 w-32">
                                  <label className="text-base font-medium">
                                    Số Lượng
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                    value={editVariantData.stock}
                                    onChange={(e) =>
                                      setEditVariantData({
                                        ...editVariantData,
                                        stock: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <div className="flex flex-col gap-1 w-32">
                                  <label className="text-base font-medium">
                                    SKU
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Nhập SKU"
                                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                    value={editVariantData.sku}
                                    onChange={(e) =>
                                      setEditVariantData({
                                        ...editVariantData,
                                        sku: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="flex flex-col gap-1 w-32">
                                  <label className="text-base font-medium">
                                    URL Hình Ảnh
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Nhập URL ảnh"
                                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                                    value={editVariantData.image}
                                    onChange={(e) =>
                                      setEditVariantData({
                                        ...editVariantData,
                                        image: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                  Cập nhật
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingVariant(null)}
                                  className="px-4 py-2 bg-gray-500 text-white rounded"
                                >
                                  Hủy
                                </button>
                              </div>
                            </form>
                          ) : (
                            // HIỂN THỊ THÔNG TIN BIẾN THỂ
                            <>
                              <p>
                                {products.find(
                                  (p) => p._id === selectedProductId
                                )?.name || "Sản phẩm"}{" "}
                                -{" "}
                                {variant.attributeRefs
                                  .map((ref) => ref.value)
                                  .join(" - ")}
                              </p>
                              <p>SKU: {variant.sku || "N/A"}</p>
                              <p>Giá: {formatCurrency(variant.price)}</p>
                              {variant.offerPrice &&
                                variant.offerPrice < variant.price && (
                                  <p className="text-red-500">
                                    Khuyến mãi:{" "}
                                    {formatCurrency(variant.offerPrice)}
                                  </p>
                                )}
                              <p>Số lượng: {variant.stock || 0}</p>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleEditVariant(variant)}
                                  className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteVariant(variant._id)
                                  }
                                  className="px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                                >
                                  Xóa
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>Không có biến thể nào.</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProductId(null);
                      setEditingVariant(null); // Reset khi đóng popup
                    }}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>

          {editingProduct && (
            <div className="mt-6 max-w-lg">
              <h2 className="text-lg font-medium mb-4">Chỉnh Sửa Sản Phẩm</h2>
              <form onSubmit={handleUpdateProduct} className="space-y-5">
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="edit-name">
                    Tên Sản Phẩm
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    placeholder="Type here"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    value={formData.name || ""}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    className="text-base font-medium"
                    htmlFor="edit-description"
                  >
                    Chi Tiết Sản Phẩm
                  </label>
                  <textarea
                    id="edit-description"
                    rows={4}
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
                    placeholder="Nhập mô tả chi tiết sản phẩm"
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    value={formData.description || ""}
                    required
                  />
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-category"
                    >
                      Loại
                    </label>
                    <select
                      id="edit-category"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          categoryName: e.target.value,
                        })
                      }
                      value={formData.categoryName || ""}
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
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-brand"
                    >
                      Hãng
                    </label>
                    <select
                      id="edit-brand"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setFormData({ ...formData, brandName: e.target.value })
                      }
                      value={formData.brandName || ""}
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
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-price"
                    >
                      Giá Sản Phẩm
                    </label>
                    <input
                      id="edit-price"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      value={formData.price !== undefined ? formData.price : ""}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-32">
                    <label
                      className="text-base font-medium"
                      htmlFor="edit-offer-price"
                    >
                      Giá Ưu Đãi
                    </label>
                    <input
                      id="edit-offer-price"
                      type="number"
                      placeholder="0"
                      className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                      onChange={(e) =>
                        setFormData({ ...formData, offerPrice: e.target.value })
                      }
                      value={
                        formData.offerPrice !== undefined
                          ? formData.offerPrice
                          : ""
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded"
                  >
                    CẬP NHẬT
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-8 py-2.5 bg-gray-500 text-white font-medium rounded"
                  >
                    HỦY
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  ); // Đóng return (...)
}; // Đóng hàm ProductList
export default ProductList;
