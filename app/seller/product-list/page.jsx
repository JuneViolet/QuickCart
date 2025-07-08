// "use client";
// import React, { useEffect, useState } from "react";
// import { useAppContext } from "@/context/AppContext";
// import Footer from "@/components/seller/Footer";
// import Loading from "@/components/Loading";
// import axios from "axios";
// import toast from "react-hot-toast";
// import ProductTable from "./ProductTable";
// import ProductEditForm from "./ProductEditForm";
// import VariantPopup from "./VariantPopup";
// import AddVariantPopup from "./AddVariantPopup"; // Import component mới
// import { assets } from "@/assets/assets";

// const ProductList = () => {
//   const { router, getToken, user, deleteProduct, formatCurrency } =
//     useAppContext();

//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     categoryName: "",
//     price: "",
//     offerPrice: "",
//     brandName: "",
//   });
//   const [variants, setVariants] = useState({});
//   const [isAddingVariant, setIsAddingVariant] = useState(null);
//   const [newVariantData, setNewVariantData] = useState({
//     productId: "",
//     attributeRefs: [],
//     price: 0,
//     offerPrice: 0,
//     stock: "",
//     sku: "",
//     image: "",
//   });
//   const [attributes, setAttributes] = useState([]);
//   const [selectedProductId, setSelectedProductId] = useState(null);
//   const [productStocks, setProductStocks] = useState({});
//   const [editingVariant, setEditingVariant] = useState(null);
//   const [editVariantData, setEditVariantData] = useState({
//     attributeRefs: [],
//     price: 0,
//     offerPrice: 0,
//     stock: "",
//     sku: "",
//     image: "",
//   });

//   // Fetch products
//   const fetchSellerProduct = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get("/api/product/seller-list", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) {
//         setProducts(data.product || []);
//         setLoading(false);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error("Fetch Product Error:", error);
//       toast.error(error.message);
//     }
//   };

//   // Fetch categories and brands
//   const fetchCategoriesAndBrands = async () => {
//     try {
//       const token = await getToken();
//       if (!token) {
//         toast.error("Vui lòng đăng nhập để tiếp tục.");
//         return;
//       }
//       const [catRes, brandRes] = await Promise.all([
//         axios.get("/api/seller/manage", {
//           headers: { Authorization: `Bearer ${token}` },
//           params: { type: "categories" },
//         }),
//         axios.get("/api/seller/manage", {
//           headers: { Authorization: `Bearer ${token}` },
//           params: { type: "brands" },
//         }),
//       ]);
//       if (catRes.data.success) setCategories(catRes.data.items);
//       if (brandRes.data.success) setBrands(brandRes.data.items);
//     } catch (error) {
//       console.error("Fetch Categories/Brands Error:", error.response?.data);
//       toast.error(
//         "Lỗi khi tải danh sách loại và hãng: " +
//           (error.response?.data?.message || error.message)
//       );
//     }
//   };

//   // Fetch attributes
//   const fetchAttributes = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get("/api/attributes", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) setAttributes(data.attributes || []);
//     } catch (error) {
//       console.error("Fetch Attributes Error:", error);
//       toast.error("Lỗi khi tải thuộc tính: " + error.message);
//     }
//   };

//   // Fetch variants
//   const fetchSellerVariants = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get("/api/variants/manage", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) {
//         const variantMap = data.variants.reduce((acc, variant) => {
//           if (!acc[variant.productId._id]) acc[variant.productId._id] = [];
//           acc[variant.productId._id].push(variant);
//           return acc;
//         }, {});
//         setVariants(variantMap);
//       } else {
//         toast.error(data.message || "Không thể tải biến thể");
//       }
//     } catch (error) {
//       console.error("Fetch Variants Error:", error);
//       toast.error("Lỗi server: " + error.message);
//     }
//   };

//   // Handle edit product
//   const handleEditProduct = (product) => {
//     if (!product._id) {
//       toast.error("Product ID is missing");
//       return;
//     }
//     setEditingProduct(product._id);
//     setFormData({
//       name: product.name || "",
//       description: product.description || "",
//       categoryName: product.category?.name || "",
//       price: product.price !== undefined ? product.price : "",
//       offerPrice: product.offerPrice !== undefined ? product.offerPrice : "",
//       brandName: product.brand?.name || "Unknown",
//     });
//   };

//   // Handle delete product
//   const handleDeleteProduct = async (productId) => {
//     if (confirm("Are you sure you want to delete this product?")) {
//       await deleteProduct(productId);
//       fetchSellerProduct();
//     }
//   };

//   // Handle update product
//   const handleUpdateProduct = async (e) => {
//     e.preventDefault();
//     if (!editingProduct) {
//       toast.error("No product selected for update");
//       return;
//     }
//     try {
//       const token = await getToken();
//       const category = categories.find(
//         (cat) => cat.name === formData.categoryName
//       );
//       const brand = brands.find((br) => br.name === formData.brandName);

//       const updatedData = {
//         name: formData.name,
//         description: formData.description,
//         categoryName: formData.categoryName,
//         price: formData.price || "0",
//         offerPrice: formData.offerPrice || "0",
//         stock: 0,
//         brandName: formData.brandName,
//       };

//       const response = await axios.put(
//         `/api/product/update/${editingProduct}`,
//         updatedData,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (response.data.success) {
//         toast.success(response.data.message);
//         setEditingProduct(null);
//         fetchSellerProduct();
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.error(
//         "Update Product Error:",
//         error.response?.data || error.message
//       );
//       toast.error(error.response?.data?.message || error.message);
//     }
//   };

//   // Handle cancel edit
//   const handleCancelEdit = () => {
//     setEditingProduct(null);
//     setFormData({
//       name: "",
//       description: "",
//       categoryName: "",
//       price: "",
//       offerPrice: "",
//       brandName: "",
//     });
//   };

//   // Handle edit variant
//   const handleEditVariant = (variant) => {
//     setEditingVariant(variant._id);
//     setEditVariantData({
//       attributeRefs: variant.attributeRefs || [],
//       price: variant.price || 0,
//       offerPrice: variant.offerPrice || 0,
//       stock: variant.stock || "",
//       sku: variant.sku || "",
//       image: variant.image || "",
//     });
//   };

//   // Handle update variant
//   const handleUpdateVariant = async (e, variantId) => {
//     e.preventDefault();
//     try {
//       const token = await getToken();
//       const formData = new FormData();
//       formData.append("price", editVariantData.price || 0);
//       formData.append("offerPrice", editVariantData.offerPrice || 0);
//       formData.append("stock", editVariantData.stock || 0);
//       formData.append("sku", editVariantData.sku || "");
//       formData.append(
//         "attributeRefs",
//         JSON.stringify(editVariantData.attributeRefs || [])
//       );
//       // Không xử lý hình ảnh ở đây vì VariantPopup đã xử lý riêng

//       const response = await axios.put(
//         `/api/variants/manage/${variantId}`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       if (response.data.success) {
//         toast.success(response.data.message);
//         setEditingVariant(null);
//         fetchSellerVariants();
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.error(
//         "Update Variant Error:",
//         error.response?.data || error.message
//       );
//       toast.error("Lỗi: " + (error.response?.data?.message || error.message));
//     }
//   };

//   // Handle delete variant
//   const handleDeleteVariant = async (variantId) => {
//     if (confirm("Are you sure you want to delete this variant?")) {
//       try {
//         const token = await getToken();
//         const response = await axios.delete(
//           `/api/variants/manage/${variantId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         if (response.data.success) {
//           toast.success(response.data.message);
//           fetchSellerVariants();
//         } else {
//           toast.error(response.data.message);
//         }
//       } catch (error) {
//         console.error("Delete Variant Error:", error);
//         toast.error(error.message);
//       }
//     }
//   };

//   // Handle add variant (chỉ làm callback)
//   const handleAddVariant = async () => {
//     try {
//       await fetchSellerVariants(); // Cập nhật danh sách biến thể
//       setIsAddingVariant(null); // Đóng popup
//       setNewVariantData({
//         productId: "",
//         attributeRefs: [],
//         price: 0,
//         offerPrice: 0,
//         stock: "",
//         sku: "",
//         image: "",
//       });
//     } catch (error) {
//       console.error("Add Variant Callback Error:", error);
//       toast.error(error.message || "Lỗi khi làm mới danh sách");
//     }
//   };

//   useEffect(() => {
//     if (user && getToken) {
//       const fetchData = async () => {
//         await Promise.all([
//           fetchSellerProduct(),
//           fetchCategoriesAndBrands(),
//           fetchAttributes(),
//           fetchSellerVariants(),
//         ]);
//       };
//       fetchData();
//     }
//   }, [user, getToken]);

//   useEffect(() => {
//     const newStocks = {};
//     products.forEach((product) => {
//       const variantStock =
//         variants[product._id]?.reduce(
//           (sum, variant) => sum + (variant.stock || 0),
//           0
//         ) || 0;
//       newStocks[product._id] = variantStock;
//     });
//     setProductStocks(newStocks);
//   }, [variants, products]);

//   return (
//     <div className="flex-1 min-h-screen flex flex-col justify-between">
//       {loading ? (
//         <Loading />
//       ) : (
//         <div className="w-full md:p-10 p-4">
//           <h2 className="pb-4 text-lg font-medium">Tất Cả Sản Phẩm</h2>
//           <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-600/20">
//             <ProductTable
//               products={products}
//               productStocks={productStocks}
//               formatCurrency={formatCurrency}
//               router={router}
//               handleEditProduct={handleEditProduct}
//               handleDeleteProduct={handleDeleteProduct}
//               isAddingVariant={isAddingVariant}
//               setIsAddingVariant={setIsAddingVariant}
//               setNewVariantData={setNewVariantData}
//               setSelectedProductId={setSelectedProductId}
//               assets={assets}
//             />
//             {editingProduct && (
//               <ProductEditForm
//                 editingProduct={editingProduct}
//                 formData={formData}
//                 setFormData={setFormData}
//                 categories={categories}
//                 brands={brands}
//                 handleUpdateProduct={handleUpdateProduct}
//                 handleCancelEdit={handleCancelEdit}
//               />
//             )}
//             {selectedProductId && (
//               <VariantPopup
//                 selectedProductId={selectedProductId}
//                 products={products}
//                 variants={variants}
//                 attributes={attributes}
//                 editVariantData={editVariantData}
//                 setEditVariantData={setEditVariantData}
//                 editingVariant={editingVariant}
//                 setEditingVariant={setEditingVariant}
//                 setSelectedProductId={setSelectedProductId}
//                 handleEditVariant={handleEditVariant}
//                 handleUpdateVariant={handleUpdateVariant}
//                 handleDeleteVariant={handleDeleteVariant}
//                 formatCurrency={formatCurrency}
//               />
//             )}
//             {isAddingVariant && (
//               <AddVariantPopup
//                 isAddingVariant={isAddingVariant}
//                 products={products}
//                 attributes={attributes}
//                 newVariantData={newVariantData}
//                 setNewVariantData={setNewVariantData}
//                 handleAddVariant={handleAddVariant}
//                 setIsAddingVariant={setIsAddingVariant}
//                 formatCurrency={formatCurrency}
//               />
//             )}
//           </div>
//         </div>
//       )}
//       <Footer />
//     </div>
//   );
// };

// export default ProductList;
"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import ProductTable from "./ProductTable";
import ProductEditForm from "./ProductEditForm";
import VariantPopup from "./VariantPopup";
import AddVariantPopup from "./AddVariantPopup";
import { assets } from "@/assets/assets";

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
    brandName: "",
    images: [],
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

  // Fetch products
  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/product/seller-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  // Fetch variants
  const fetchSellerVariants = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/variants/manage", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const variantMap = data.variants.reduce((acc, variant) => {
          if (!acc[variant.productId._id]) acc[variant.productId._id] = [];
          acc[variant.productId._id].push(variant);
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
      images: product.images || [],
    });
    setImagePreviews(product.images || []);
    setImageFiles([]);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(productId);
      fetchSellerProduct();
    }
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
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("categoryName", formData.categoryName);
      formDataToSend.append("price", formData.price || "0");
      formDataToSend.append("offerPrice", formData.offerPrice || "0");
      formDataToSend.append("brandName", formData.brandName);
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
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setEditingProduct(null);
        setImageFiles([]);
        setImagePreviews([]);
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
      images: [],
    });
    setImageFiles([]);
    setImagePreviews([]);
  };

  // Handle edit variant
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

  // Handle update variant
  const handleUpdateVariant = async (e, variantId) => {
    e.preventDefault();
    try {
      const token = await getToken();
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
            Authorization: `Bearer ${token}`,
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

  // Handle delete variant
  const handleDeleteVariant = async (variantId) => {
    if (confirm("Are you sure you want to delete this variant?")) {
      try {
        const token = await getToken();
        const response = await axios.delete(
          `/api/variants/manage/${variantId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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

  // Handle add variant (chỉ làm callback)
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

  // Handle image change
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

  // Handle remove image
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
            <ProductTable
              products={products}
              productStocks={productStocks}
              formatCurrency={formatCurrency}
              router={router}
              handleEditProduct={handleEditProduct}
              handleDeleteProduct={handleDeleteProduct}
              isAddingVariant={isAddingVariant}
              setIsAddingVariant={setIsAddingVariant}
              setNewVariantData={setNewVariantData}
              setSelectedProductId={setSelectedProductId}
              assets={assets}
            />
            {editingProduct && (
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
