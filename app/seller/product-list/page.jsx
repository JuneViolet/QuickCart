"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import { toast } from "react-hot-toast";
import ProductTable from "./ProductTable";
import ProductEditForm from "./ProductEditForm";
import VariantPopup from "./VariantPopup";
import AddVariantPopup from "./AddVariantPopup";
import { assets } from "@/assets/assets";
import { join } from "lodash";

const ProductList = () => {
  const { router, user, deleteProduct, formatCurrency } = useAppContext();

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
    brandName: "",
    images: [],
    keywords: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [variants, setVariants] = useState({});
  const [isAddingVariant, setIsAddingVariant] = useState(null);
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
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productStocks, setProductStocks] = useState({});
  const [editingVariant, setEditingVariant] = useState(null);
  const [editVariantData, setEditVariantData] = useState({
    attributeRefs: [],
    price: 0,
    offerPrice: 0,
    stock: "",
    sku: "",
    image: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productOrders, setProductOrders] = useState({}); // Lưu thông tin đơn hàng của sản phẩm
  const [togglingProduct, setTogglingProduct] = useState(null); // State cho việc toggle active

  // Fetch seller products (danh sách ban đầu)
  const fetchSellerProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/product/seller-list");
      if (data?.success) {
        const products = data.products || [];
        setProducts(products);
        if (products.length === 0) {
          toast("Không có sản phẩm nào.", { icon: "ℹ️" });
        }
      } else {
        toast.error(data?.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error(
        "Fetch Seller Product Error:",
        error.response?.data || error
      );
      toast.error(
        error.response?.data?.message || error.message || "Lỗi khi tải sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch search products
  const fetchSearchProducts = async (query, category) => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/product/list", {
        params: {
          query: query || "",
          category: category || "",
          userId: user.id, // Lọc sản phẩm của seller
        },
      });
      if (data?.success) {
        const products = data.products || [];
        setProducts(products);
        if (products.length === 0) {
          toast("Không tìm thấy sản phẩm nào.", { icon: "ℹ️" });
        }
      } else {
        toast.error(data?.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error(
        "Fetch Search Product Error:",
        error.response?.data || error
      );
      toast.error(
        error.response?.data?.message || error.message || "Lỗi khi tải sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    fetchSearchProducts(searchQuery, selectedCategory);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle category change without reload
  const handleCategoryChange = async (e) => {
    e.preventDefault();
    const category = e.target.value;
    setSelectedCategory(category);
    await fetchSearchProducts(searchQuery, category);
  };

  // Reset to all products
  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("");
    fetchSellerProduct();
  };

  // Fetch categories and brands
  const fetchCategoriesAndBrands = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        axios.get("/api/seller/manage", {
          params: { type: "categories" },
        }),
        axios.get("/api/seller/manage", {
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
      const { data } = await axios.get("/api/attributes");
      if (data.success) setAttributes(data.attributes || []);
    } catch (error) {
      console.error("Fetch Attributes Error:", error);
      toast.error("Lỗi khi tải thuộc tính: " + error.message);
    }
  };

  // Fetch variants
  const fetchSellerVariants = async () => {
    try {
      const { data } = await axios.get("/api/variants/manage");
      if (data.success) {
        const variantMap = data.variants.reduce((acc, variant) => {
          if (variant.productId && variant.productId._id) {
            if (!acc[variant.productId._id]) acc[variant.productId._id] = [];
            acc[variant.productId._id].push(variant);
          }
          return acc;
        }, {});
        setVariants(variantMap);
      } else {
        toast.error(data.message || "Không thể tải biến thể");
      }
    } catch (error) {
      console.error("Fetch Variants Error:", error);
      toast.error("Lỗi server: " + error.message);
    }
  };

  // Kiểm tra sản phẩm có đơn hàng hay không
  const checkProductOrders = async () => {
    try {
      const { data } = await axios.get("/api/seller/product-orders");
      if (data.success) {
        setProductOrders(data.productOrders || {});
      }
    } catch (error) {
      console.error("Check Product Orders Error:", error);
      // Không hiển thị toast error để tránh làm phiền user
    }
  };

  // Toggle trạng thái active của sản phẩm
  const handleToggleProductActive = async (productId, currentStatus) => {
    try {
      setTogglingProduct(productId);
      const { data } = await axios.put(
        `/api/product/toggle-active/${productId}`,
        { isActive: !currentStatus }
      );

      if (data.success) {
        toast.success(
          !currentStatus
            ? "Sản phẩm đã được kích hoạt"
            : "Sản phẩm đã được tạm dừng hoạt động"
        );
        fetchSellerProduct(); // Refresh danh sách
      } else {
        toast.error(data.message || "Không thể thay đổi trạng thái sản phẩm");
      }
    } catch (error) {
      console.error("Toggle Product Active Error:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi thay đổi trạng thái sản phẩm"
      );
    } finally {
      setTogglingProduct(null);
    }
  };

  // Handle edit product, delete product, update product, cancel edit, edit variant, update variant, delete variant, add variant, image change, remove image
  const handleEditProduct = (product) => {
    if (!product || !product._id) {
      toast.error("❌ ID sản phẩm bị thiếu hoặc không hợp lệ");
      return;
    }

    toast.success("✏️ Đã mở form chỉnh sửa sản phẩm", {
      duration: 2000,
    });

    setEditingProduct(product._id);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      categoryName: product.category?.name || "",
      price: product.price !== undefined ? product.price : "",
      offerPrice: product.offerPrice !== undefined ? product.offerPrice : "",
      brandName: product.brand?.name || "Unknown",
      images: product.images || [],
      keywords: product.keywords?.join(", ") || "",
    });
    setImagePreviews(product.images || []);
    setImageFiles([]);
  };

  const handleDeleteProduct = async (productId) => {
    // Kiểm tra xem sản phẩm có đơn hàng hay không
    const hasOrders = productOrders[productId] && productOrders[productId] > 0;

    if (hasOrders) {
      toast.error(
        `❌ Không thể xóa sản phẩm này!\n\n` +
          `🛒 Sản phẩm đã có ${productOrders[productId]} đơn hàng liên quan.\n\n` +
          `💡 Gợi ý: Bạn có thể tạm dừng hoạt động sản phẩm thay vì xóa để khách hàng không thể đặt hàng mới.`,
        {
          duration: 8000,
          style: {
            maxWidth: "500px",
          },
        }
      );
      return;
    }

    const confirmMessage =
      `⚠️ Xác nhận xóa sản phẩm\n\n` +
      `Bạn có chắc chắn muốn xóa sản phẩm này không?\n\n` +
      `❗ Hành động này không thể hoàn tác!`;

    if (confirm(confirmMessage)) {
      try {
        await deleteProduct(productId);
        toast.success("✅ Đã xóa sản phẩm thành công!");
        fetchSellerProduct();
        // Cập nhật lại thông tin đơn hàng sau khi xóa
        checkProductOrders();
      } catch (error) {
        toast.error("❌ Lỗi khi xóa sản phẩm: " + error.message);
      }
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) {
      toast.error("❌ Không có sản phẩm nào được chọn để cập nhật");
      return;
    }

    // Hiển thị loading
    const loadingToast = toast.loading("🔄 Đang cập nhật sản phẩm...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("categoryName", formData.categoryName);
      formDataToSend.append("price", formData.price || "0");
      formDataToSend.append("offerPrice", formData.offerPrice || "0");
      formDataToSend.append("brandName", formData.brandName);
      formDataToSend.append("keywords", formData.keywords || "");
      (formData.images || []).forEach((img) => {
        if (typeof img === "string")
          formDataToSend.append("existingImages", img);
      });
      imageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const response = await axios.put(
        `/api/product/update/${editingProduct}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success(
          "✅ " + (response.data.message || "Cập nhật sản phẩm thành công!")
        );
        setEditingProduct(null);
        setImageFiles([]);
        setImagePreviews([]);
        fetchSellerProduct();
      } else {
        toast.error("❌ " + (response.data.message || "Cập nhật thất bại"));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error(
        "Update Product Error:",
        error.response?.data || error.message
      );
      toast.error(
        "❌ Lỗi cập nhật: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleCancelEdit = () => {
    toast.info("🚫 Đã hủy chỉnh sửa sản phẩm", {
      duration: 2000,
    });

    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      categoryName: "",
      price: "",
      offerPrice: "",
      brandName: "",
      images: [],
      keywords: "",
    });
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant._id);
    setEditVariantData({
      attributeRefs: variant.attributeRefs || [],
      price: variant.price || 0,
      offerPrice: variant.offerPrice || 0,
      stock: variant.stock || "",
      sku: variant.sku || "",
      image: variant.image || "",
    });
  };

  const handleUpdateVariant = async (e, variantId) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("price", editVariantData.price || 0);
      formData.append("offerPrice", editVariantData.offerPrice || 0);
      formData.append("stock", editVariantData.stock || 0);
      formData.append("sku", editVariantData.sku || "");
      formData.append(
        "attributeRefs",
        JSON.stringify(editVariantData.attributeRefs || [])
      );

      const response = await axios.put(
        `/api/variants/manage/${variantId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setEditingVariant(null);
        fetchSellerVariants();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(
        "Update Variant Error:",
        error.response?.data || error.message
      );
      toast.error("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (confirm("Bạn có chắc muốn xóa biến thể này?")) {
      try {
        const response = await axios.delete(
          `/api/variants/manage/${variantId}`
        );
        if (response.data.success) {
          toast.success(response.data.message);
          fetchSellerVariants();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error("Delete Variant Error:", error);
        toast.error(error.message);
      }
    }
  };

  const handleAddVariant = async () => {
    try {
      await fetchSellerVariants();
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
    } catch (error) {
      console.error("Add Variant Callback Error:", error);
      toast.error(error.message || "Lỗi khi làm mới danh sách");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - imageFiles.length);
    if (files.length > 0) {
      const newFiles = [...imageFiles, ...files];
      const newPreviews = [...imagePreviews];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (
            newPreviews.length ===
            newFiles.length + (formData.images.length || 0)
          ) {
            setImageFiles(newFiles);
            setImagePreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index) => {
    if (index < (formData.images.length || 0)) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData({ ...formData, images: newImages });
      setImagePreviews(newImages);
    } else {
      const newIndex = index - (formData.images.length || 0);
      const newFiles = imageFiles.filter((_, i) => i !== newIndex);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImageFiles(newFiles);
      setImagePreviews(newPreviews);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        await Promise.all([
          fetchSellerProduct(),
          fetchCategoriesAndBrands(),
          fetchAttributes(),
          fetchSellerVariants(),
          checkProductOrders(), // Thêm kiểm tra đơn hàng
        ]);
      };
      fetchData();
    }
  }, [user]);

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
          <div className="mb-6">
            <h2 className="pb-2 text-xl font-semibold text-gray-800">
              Tất Cả Sản Phẩm
            </h2>
            <p className="text-sm text-gray-600">
              💡 <strong>Lưu ý:</strong> Sản phẩm đã có đơn hàng sẽ không thể
              xóa được. Bạn có thể tạm dừng hoạt động thay vì xóa.
            </p>
          </div>
          <div className="flex flex-col gap-4 max-w-6xl w-full overflow-hidden rounded-md bg-white border border-gray-600/20">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 p-4">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full md:w-1/2 p-2 border rounded"
              />
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full md:w-1/4 p-2 border rounded"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSearch}
                className="w-full md:w-1/6 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tìm
              </button>
              <button
                onClick={handleReset}
                className="w-full md:w-1/6 p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
            {products.length === 0 ? (
              <p className="p-4 text-gray-500">Không có sản phẩm nào.</p>
            ) : (
              <ProductTable
                products={products}
                productStocks={productStocks}
                productOrders={productOrders}
                formatCurrency={formatCurrency}
                router={router}
                handleEditProduct={handleEditProduct}
                handleDeleteProduct={handleDeleteProduct}
                handleToggleProductActive={handleToggleProductActive}
                togglingProduct={togglingProduct}
                isAddingVariant={isAddingVariant}
                setIsAddingVariant={setIsAddingVariant}
                setNewVariantData={setNewVariantData}
                setSelectedProductId={setSelectedProductId}
                assets={assets}
              />
            )}
            {/* Form chỉnh sửa sản phẩm */}
            {editingProduct && (
              <div className="mt-6 p-6 bg-white border border-gray-300 rounded-lg shadow-lg">
                <ProductEditForm
                  editingProduct={editingProduct}
                  formData={formData}
                  setFormData={setFormData}
                  categories={categories}
                  brands={brands}
                  handleUpdateProduct={handleUpdateProduct}
                  handleCancelEdit={handleCancelEdit}
                  imageFiles={imageFiles}
                  imagePreviews={imagePreviews}
                  handleImageChange={handleImageChange}
                  handleRemoveImage={handleRemoveImage}
                />
              </div>
            )}
            {selectedProductId && (
              <VariantPopup
                selectedProductId={selectedProductId}
                products={products}
                variants={variants}
                attributes={attributes}
                editVariantData={editVariantData}
                setEditVariantData={setEditVariantData}
                editingVariant={editingVariant}
                setEditingVariant={setEditingVariant}
                setSelectedProductId={setSelectedProductId}
                handleEditVariant={handleEditVariant}
                handleUpdateVariant={handleUpdateVariant}
                handleDeleteVariant={handleDeleteVariant}
                formatCurrency={formatCurrency}
              />
            )}
            {isAddingVariant && (
              <AddVariantPopup
                isAddingVariant={isAddingVariant}
                products={products}
                attributes={attributes}
                newVariantData={newVariantData}
                setNewVariantData={setNewVariantData}
                handleAddVariant={handleAddVariant}
                setIsAddingVariant={setIsAddingVariant}
                formatCurrency={formatCurrency}
              />
            )}
          </div>
        </div>
      )}
      {/* <Footer /> */}
    </div>
  );
};

export default ProductList;
