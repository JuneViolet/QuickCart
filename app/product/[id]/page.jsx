"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductInfo from "@/components/ProductInfo";
import ProductSpecifications from "@/components/ProductSpecifications";
import ProductRating from "@/components/ProductRating";
import ProductComments from "@/components/ProductComments";
import RelatedProducts from "@/components/RelatedProducts";
import { useAppContext } from "@/context/AppContext";

const Product = () => {
  const { id } = useParams();
  const { router, addToCart, formatCurrency } = useAppContext();
  const { getToken, userId } = useAuth();
  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`/api/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.data.success)
        throw new Error(response.data.message || "Failed to fetch product");
      const data = response.data.product;
      console.log("Product Data:", data);

      const userRating = data.ratings.find((r) => r.userId === userId);
      setExistingRating(userRating ? userRating.rating : null);

      setHasPurchased(data.hasPurchased || false);
      setProductData(data);
      if (data.variants?.length > 0) {
        const firstVariant = data.variants[0];
        const colorAttr = firstVariant.attributeRefs?.find(
          (ref) => ref.attributeId.name === "Màu sắc"
        )?.value;
        const storageAttr = firstVariant.attributeRefs?.find(
          (ref) => ref.attributeId.name === "Dung lượng"
        )?.value;
        setSelectedColor(colorAttr || "");
        setSelectedStorage(storageAttr || "");
      }

      // Fetch related products after getting product data
      await fetchRelatedProducts(data.category?.name, data.brand?.name);
    } catch (error) {
      console.error("Fetch Product Error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryName, brandName) => {
    try {
      const token = await getToken();
      console.log("Fetching related products for:", {
        categoryName,
        brandName,
        currentProductId: id,
      });

      let relatedProducts = [];

      // Bước 1: Lấy sản phẩm cùng category và brand (ưu tiên cao nhất)
      if (categoryName && brandName) {
        const sameCategoryBrandResponse = await axios.get(`/api/product/list`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            category: categoryName,
            brand: brandName,
            limit: 10,
          },
        });

        const sameCategoryBrandProducts =
          sameCategoryBrandResponse.data.products?.filter(
            (product) => product._id !== id
          ) || [];

        relatedProducts = [...sameCategoryBrandProducts];
        console.log(
          `Found ${sameCategoryBrandProducts.length} products with same category + brand`
        );
      }

      // Bước 2: Nếu chưa có sản phẩm nào, lấy sản phẩm cùng category (khác brand)
      if (relatedProducts.length === 0 && categoryName) {
        const sameCategoryResponse = await axios.get(`/api/product/list`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            category: categoryName,
            limit: 10,
          },
        });

        const sameCategoryProducts =
          sameCategoryResponse.data.products?.filter(
            (product) => product._id !== id
          ) || [];

        relatedProducts = [...sameCategoryProducts];
        console.log(
          `Found ${sameCategoryProducts.length} products with same category`
        );
      }

      // KHÔNG lấy random products nữa - chỉ hiển thị sản phẩm thực sự liên quan
      // Nếu không có sản phẩm liên quan thì để trống

      console.log(
        "Final related products:",
        relatedProducts.map((p) => ({
          id: p._id,
          name: p.name,
          category: p.category?.name,
          brand: p.brand?.name,
        }))
      );

      // Update productData with related products
      setProductData((prev) => ({
        ...prev,
        relatedProducts: relatedProducts,
      }));
    } catch (error) {
      console.error("Fetch Related Products Error:", error.message);
      // If error, set empty array to prevent crash
      setProductData((prev) => ({
        ...prev,
        relatedProducts: [],
      }));
    }
  };

  const fetchAttributes = async () => {
    try {
      const token = await getToken();
      const response = await axios.get("/api/attributes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const attrs = response.data.attributes || [];
        console.log("Fetched Attributes:", attrs);
        setAttributes(attrs);
      }
    } catch (error) {
      console.error("Fetch Attributes Error:", error.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAttributes().then(() => {
        fetchProductData();
      });
    }
  }, [id]);

  const handleSubmitRating = async () => {
    await fetchProductData();
  };

  const handleCommentUpdate = async () => {
    await fetchProductData();
  };

  const handleAddToCart = () => {
    // Ràng buộc kinh doanh: Kiểm tra tồn kho trước khi thêm vào giỏ hàng
    if (!selectedVariant) {
      toast.error("Vui lòng chọn phiên bản sản phẩm!");
      return;
    }
    if (selectedVariant.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng! Vui lòng chọn sản phẩm khác.");
      return;
    }
    addToCart(id, 1, selectedVariant._id);
    toast.success("Đã thêm sản phẩm vào giỏ hàng!");
  };

  const handleBuyNow = () => {
    // Ràng buộc kinh doanh: Kiểm tra tồn kho trước khi mua ngay
    if (!selectedVariant) {
      toast.error("Vui lòng chọn phiên bản sản phẩm!");
      return;
    }
    if (selectedVariant.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng! Không thể đặt hàng.");
      return;
    }
    addToCart(id, 1, selectedVariant._id);
    router.push("/cart");
  };

  useEffect(() => {
    if (productData?.variants) {
      const matchedVariant = productData.variants.find((v) => {
        const colorMatch = v.attributeRefs.find(
          (ref) =>
            ref.value === selectedColor && ref.attributeId.name === "Màu sắc"
        );
        const storageMatch = selectedStorage
          ? v.attributeRefs.find(
              (ref) =>
                ref.value === selectedStorage &&
                ref.attributeId.name === "Dung lượng"
            )
          : true;
        return colorMatch && storageMatch;
      });
      setSelectedVariant(matchedVariant || null);
      if (matchedVariant?.images && matchedVariant.images.length > 0) {
        setMainImage(matchedVariant.images[0]);
      } else if (productData.images?.[0]) {
        setMainImage(productData.images[0]);
      }
      console.log("Selected Variant:", matchedVariant);
    }
  }, [selectedColor, selectedStorage, productData]);

  return loading ? (
    <Loading />
  ) : error ? (
    <div className="text-center py-10">Error: {error}</div>
  ) : !productData ? (
    <div className="text-center py-10">No product data</div>
  ) : (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <ProductImageGallery
              productName={productData.name}
              mainImage={mainImage}
              setMainImage={setMainImage}
              selectedVariant={selectedVariant}
              productImages={productData.images}
            />
            <ProductSpecifications
              specifications={productData.specifications}
            />
          </div>
          <ProductInfo
            productData={productData}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedStorage={selectedStorage}
            setSelectedStorage={setSelectedStorage}
            selectedVariant={selectedVariant}
            attributes={attributes}
            formatCurrency={formatCurrency}
            handleAddToCart={handleAddToCart}
            handleBuyNow={handleBuyNow}
          />
        </div>

        {/* Rating và Comment Section */}
        <div className="mt-8 space-y-6">
          <ProductRating
            productId={id}
            hasPurchased={hasPurchased}
            existingRating={existingRating}
            averageRating={productData?.averageRating || 0}
            totalRatings={productData.ratings?.length}
            onRatingUpdate={handleSubmitRating}
          />

          <ProductComments
            productId={id}
            productUserId={productData.userId}
            comments={productData.comments}
            ratings={productData.ratings}
            hasPurchased={hasPurchased}
            onCommentUpdate={handleCommentUpdate}
          />
        </div>

        <RelatedProducts
          relatedProducts={productData?.relatedProducts}
          categoryName={productData?.category?.name}
          router={router}
        />
      </div>
      <Footer />
    </>
  );
};

export default Product;
