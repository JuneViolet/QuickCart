//chay dc ghn
"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import Address from "@/models/Address";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import mongoose from "mongoose";
import { debounce } from "lodash"; // Đảm bảo cài đặt: npm install lodash
import { useRouter } from "next/navigation"; // Add Next.js router

const Cart = () => {
  const {
    router: contextRouter,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    formatCurrency,
    getToken,
  } = useAppContext();
  const nextRouter = useRouter(); // Next.js router as backup
  const { isSignedIn } = useUser();
  const [shippingFee, setShippingFee] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [specifications, setSpecifications] = useState({});
  const [variants, setVariants] = useState({});
  const [isDataReady, setIsDataReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Navigate to product detail function
  const navigateToProduct = useCallback(
    (productId) => {
      if (!productId) return;

      try {
        if (nextRouter && nextRouter.push) {
          nextRouter.push(`/product/${productId}`);
        } else if (contextRouter && contextRouter.push) {
          contextRouter.push(`/product/${productId}`);
        } else {
          window.location.href = `/product/${productId}`;
        }

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } catch (error) {
        window.location.href = `/product/${productId}`;
      }
    },
    [contextRouter, nextRouter]
  );

  // Fetch default address
  const fetchDefaultAddress = useCallback(async () => {
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get("/api/user/get-address", { headers });
      if (data.success && data.addresses.length > 0) {
        const defaultAddr =
          data.addresses.find((a) => a.isDefault) || data.addresses[0];
        setDefaultAddress(defaultAddr);
      } else {
        toast.error("Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ!");
        contextRouter.push("/add-address");
      }
    } catch (error) {
      toast.error("Không thể lấy địa chỉ mặc định. Vui lòng thử lại!");
    }
  }, [getToken, contextRouter]);

  // Fetch specifications and variants
  const fetchSpecificationsAndVariants = useCallback(async () => {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const itemIds = Object.keys(cartItems);
        if (itemIds.length === 0) {
          setSpecifications({});
          setVariants({});
          return;
        }

        const productIds = itemIds.map((id) => id.split("_")[0]);
        const validProductIds = productIds.filter((id) =>
          mongoose.Types.ObjectId.isValid(id)
        );
        if (validProductIds.length === 0) {
          setSpecifications({});
          setVariants({});
          return;
        }

        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const specResponse = await axios.post(
          "/api/specifications/list",
          { productIds: validProductIds },
          { headers }
        );
        if (specResponse.data.success) {
          const specs = specResponse.data.specifications.reduce((acc, spec) => {
            acc[spec.productId] = spec.specs;
            return acc;
          }, {});
          setSpecifications(specs);
        }

        const variantPromises = validProductIds.map(async (id) => {
          const response = await axios.get(`/api/product/${id}`, { headers });
          if (response.data.success) {
            return { [id]: response.data.product.variants || [] };
          }
          return { [id]: [] };
        });
        const variantResults = await Promise.all(variantPromises);
        setVariants(
          variantResults.reduce((acc, curr) => ({ ...acc, ...curr }), {})
        );
        break;
      } catch (error) {
        if (attempt === maxRetries) {
          toast.error(
            "Không thể lấy thông số kỹ thuật hoặc biến thể sau nhiều lần thử!"
          );
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }, [cartItems, getToken]);

  // Initial data fetch
  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDefaultAddress(),
        fetchSpecificationsAndVariants(),
      ]);
      setIsDataReady(true);
      setLoading(false);
    };

    fetchData();
  }, [isSignedIn, fetchDefaultAddress, fetchSpecificationsAndVariants]);

  // Calculate shipping fee
  const calculateShippingFee = useCallback(async () => {
    if (
      !isDataReady ||
      !defaultAddress ||
      !defaultAddress.districtId ||
      !defaultAddress.wardCode ||
      !defaultAddress.area ||
      Object.keys(cartItems).length === 0
    ) {
      setShippingFee(0);
      return;
    }

    setShippingLoading(true);
    try {
      const totalWeight = Object.values(cartItems).reduce((sum, item) => {
        const productId = item.productId || item.key.split("_")[0];
        const variant = variants[productId]?.find(
          (v) => v._id.toString() === item.variantId
        );
        const specs = specifications[productId] || [];
        let weight = 50;
        const weightSpec = specs.find(
          (s) => s.key.toLowerCase() === "trọng lượng"
        );
        if (weightSpec) {
          const weightValue = parseFloat(
            weightSpec.value.replace(/[^0-9.]/g, "")
          );
          if (!isNaN(weightValue)) weight = weightValue;
        }
        const quantity = item.quantity || 1;
        return sum + weight * quantity;
      }, 0);

      if (totalWeight <= 0) {
        throw new Error("Total weight must be greater than 0");
      }

      const totalValue = Object.values(cartItems).reduce((sum, item) => {
        const productId = item.productId || item.key.split("_")[0];
        const variant = variants[productId]?.find(
          (v) => v._id.toString() === item.variantId
        );
        const price = variant?.offerPrice || item.offerPrice || 0;
        return sum + price * (item.quantity || 1);
      }, 0);

      if (totalValue <= 0) {
        throw new Error("Total value must be greater than 0");
      }

      const payload = {
        districtId: parseInt(defaultAddress.districtId),
        wardCode: defaultAddress.wardCode,
        address: defaultAddress.area,
        weight: Math.max(totalWeight, 50),
        value: totalValue,
      };

      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post("/api/shipping/fee", payload, {
        headers,
      });

      if (response.data.success) {
        setShippingFee(response.data.data.fee || 0);
      } else {
        throw new Error(
          response.data.message || "Failed to calculate shipping fee"
        );
      }
    } catch (error) {
      setShippingFee(0);
      toast.error("Không thể tính phí vận chuyển: " + error.message);
    } finally {
      setShippingLoading(false);
    }
  }, [
    isDataReady,
    defaultAddress,
    cartItems,
    specifications,
    variants,
    getToken,
  ]);

  // Debounce with longer delay and strict condition
  const debouncedCalculateShippingFee = useMemo(
    () =>
      debounce((prevValue) => {
        const currentValue = JSON.stringify(cartItems);
        if (prevValue !== currentValue) {
          calculateShippingFee();
        }
      }, 1000),
    [calculateShippingFee]
  );

  // Trigger shipping fee calculation only when cartItems change significantly
  useEffect(() => {
    let prevCartItems = null;
    if (isDataReady && defaultAddress && Object.keys(cartItems).length > 0) {
      debouncedCalculateShippingFee(JSON.stringify(cartItems));
      prevCartItems = JSON.stringify(cartItems);
    }
    return () => {
      debouncedCalculateShippingFee.cancel();
      prevCartItems = null;
    };
  }, [isDataReady, defaultAddress, cartItems, debouncedCalculateShippingFee]);

  // Debounce handleCheckout to prevent multiple calls
  const debouncedHandleCheckout = useMemo(
    () =>
      debounce(async () => {
        try {
          const token = await getToken();
          const headers = { Authorization: `Bearer ${token}` };
          const items = Object.entries(cartItems).map(([key, item]) => ({
            product: item.productId || key.split("_")[0],
            variantId: item.variantId,
            quantity: item.quantity,
          }));
          const response = await axios.post(
            "/api/order/create",
            {
              address: defaultAddress._id,
              items,
              paymentMethod: "COD",
            },
            { headers }
          );

          if (response.data.success) {
            toast.success("Đặt hàng thành công!");
            setCartItems({});
            contextRouter.push("/order-success");
          } else {
            toast.error(response.data.message || "Đặt hàng thất bại!");
          }
        } catch (error) {
          toast.error("Lỗi khi đặt hàng: " + error.message);
        }
      }, 2000),
    [defaultAddress, cartItems, getToken, contextRouter]
  );

  // Handle checkout with single API call
  const handleCheckout = async () => {
    if (
      !defaultAddress ||
      Object.keys(cartItems).length === 0 ||
      shippingLoading ||
      (shippingFee === null && !shippingLoading) ||
      checkoutLoading
    ) {
      if (!defaultAddress) {
        toast.error("Vui lòng thêm địa chỉ giao hàng trước khi thanh toán!");
        contextRouter.push("/add-address");
      } else if (Object.keys(cartItems).length === 0) {
        toast.error("Giỏ hàng trống, vui lòng thêm sản phẩm!");
      } else if (
        shippingLoading ||
        (shippingFee === null && !shippingLoading)
      ) {
        toast.error("Vui lòng đợi tính phí vận chuyển trước khi thanh toán!");
      }
      return;
    }

    setCheckoutLoading(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const items = Object.entries(cartItems).map(([key, item]) => ({
        product: item.productId || key.split("_")[0],
        variantId: item.variantId,
        quantity: item.quantity,
      }));
      const response = await axios.post(
        "/api/order/create",
        {
          address: defaultAddress._id,
          items,
          paymentMethod: "COD",
        },
        { headers }
      );

      if (response.data.success) {
        const { trackingCode } = response.data.order;
        if (response.data.order.status === "pending") {
          toast.success("Đặt hàng thành công!");
          setCartItems({});
          contextRouter.push("/order-success");
        } else {
          toast.error("Đặt hàng thất bại do trạng thái không hợp lệ!");
        }
      } else {
        toast.error(response.data.message || "Đặt hàng thất bại!");
      }
    } catch (error) {
      toast.error("Lỗi khi đặt hàng: " + error.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Memoize OrderSummary and table rows
  const memoizedOrderSummary = useMemo(
    () => <OrderSummary shippingFee={shippingFee} />,
    [shippingFee]
  );

  const memoizedTableRows = useMemo(
    () =>
      Object.entries(cartItems).map(([itemKey, item]) => {
        const [productId] = itemKey.split("_");
        const variant = variants[productId]?.find(
          (v) => v._id.toString() === item.variantId
        );
        const color = variant?.attributeRefs?.find(
          (ref) => ref.attributeId.name === "Màu sắc"
        )?.value;
        const storage = variant?.attributeRefs?.find(
          (ref) => ref.attributeId.name === "Dung lượng"
        )?.value;
        const price = variant?.offerPrice || item.offerPrice || 0;

        return (
          <tr key={itemKey}>
            <td className="flex items-center gap-4 py-4 md:px-4 px-1">
              <div>
                <div
                  className="w-16 h-16 rounded-lg overflow-hidden bg-gray-500/10 p-2 cursor-pointer hover:bg-gray-500/20 transition-colors group relative flex items-center justify-center"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigateToProduct(productId);
                  }}
                >
                  {(variant?.images && variant.images[0]) || item.image ? (
                    <Image
                      src={(variant?.images && variant.images[0]) || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover pointer-events-none"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center pointer-events-none">
                      <span className="text-gray-500 text-xs">No Image</span>
                    </div>
                  )}
                </div>
                <button
                  className="md:hidden text-xs text-orange-600 mt-1"
                  onClick={() => updateCartQuantity(itemKey, 0)}
                >
                  Remove
                </button>
              </div>
              <div className="text-sm hidden md:block">
                <div
                  className="text-gray-800 cursor-pointer hover:text-orange-600 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigateToProduct(productId);
                  }}
                >
                  {item.name} {color && `(${color}`}
                  {storage && `/${storage})`}
                </div>
                {/* Hiển thị stock còn lại */}
                {variant?.stock && (
                  <div
                    className={`text-xs mt-1 ${
                      variant.stock > 10
                        ? "text-green-600"
                        : variant.stock > 0
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    Còn {variant.stock} sản phẩm
                  </div>
                )}
                <button
                  className="text-xs text-orange-600 mt-1"
                  onClick={() => updateCartQuantity(itemKey, 0)}
                >
                  Remove
                </button>
              </div>
            </td>
            <td className="py-4 md:px-4 px-1 min-w-[120px]">
              <div className="text-gray-600 flex items-center whitespace-nowrap">
                <span>{formatCurrency(price)}</span>
              </div>
            </td>
            <td className="py-4 md:px-4 px-1 text-center">
              <div className="flex items-center justify-center md:gap-2 gap-1">
                <button
                  onClick={() =>
                    updateCartQuantity(itemKey, Math.max(1, item.quantity - 1))
                  }
                  disabled={item.quantity <= 1}
                  className={`w-8 h-8 flex items-center justify-center rounded ${
                    item.quantity <= 1
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-orange-200"
                  }`}
                >
                  <Image
                    src={assets.decrease_arrow}
                    alt="decrease_arrow"
                    className="w-4 h-4"
                  />
                </button>

                <input
                  onChange={(e) => {
                    const inputValue = Number(e.target.value);
                    //  Giới hạn quantity theo stock
                    let newQuantity = Math.max(1, inputValue);
                    if (variant?.stock && newQuantity > variant.stock) {
                      newQuantity = variant.stock;
                      toast.error(
                        `Chỉ còn ${variant.stock} sản phẩm trong kho!`
                      );
                    }
                    updateCartQuantity(itemKey, newQuantity);
                  }}
                  type="number"
                  value={item.quantity}
                  className="w-8 border text-center appearance-none"
                  min="1"
                  max={variant?.stock || 999}
                />
                <button
                  onClick={() => {
                    const newQuantity = item.quantity + 1;
                    if (variant?.stock && newQuantity > variant.stock) {
                      toast.error(
                        `Chỉ còn ${variant.stock} sản phẩm trong kho!`
                      );
                      return;
                    }
                    updateCartQuantity(itemKey, newQuantity);
                  }}
                  disabled={variant?.stock && item.quantity >= variant?.stock}
                  className={`w-8 h-8 flex items-center justify-center rounded ${
                    variant?.stock && item.quantity >= variant?.stock
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-orange-200"
                  }`}
                >
                  <Image
                    src={assets.increase_arrow}
                    alt="increase_arrow"
                    className="w-4 h-4"
                  />
                </button>
              </div>
            </td>
            <td className="py-4 md:px-4 px-1 min-w-[120px]">
              <div className="text-gray-600 flex items-center whitespace-nowrap">
                <span>{formatCurrency(price * item.quantity)}</span>
              </div>
            </td>
          </tr>
        );
      }),
    [cartItems, variants, updateCartQuantity, navigateToProduct, formatCurrency]
  );

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Giỏ <span className="font-medium text-orange-600">Hàng</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">
              {getCartCount()} Sản Phẩm
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="text-left">
                <tr>
                  <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Chi Tiết Sản Phẩm
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium min-w-[120px]">
                    Giá
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium text-center">
                    Số Lượng
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium min-w-[120px]">
                    Tổng Cộng
                  </th>
                </tr>
              </thead>
              <tbody>{memoizedTableRows}</tbody>
            </table>
          </div>
          <button
            onClick={() => contextRouter.push("/all-products")}
            className="group flex items-center mt-6 gap-2 text-orange-600"
          >
            <Image
              className="group-hover:-translate-x-1 transition"
              src={assets.arrow_right_icon_colored}
              alt="arrow_right_icon_colored"
            />
            Tiếp Tục Shopping
          </button>
        </div>
        <div>
          <div className="relative">
            {shippingLoading && (
              <div className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center p-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Đang tính phí...</span>
                </div>
              </div>
            )}
            {memoizedOrderSummary}
          </div>
          {/* <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className={`mt-6 w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition ${
              checkoutLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {checkoutLoading ? "Đang xử lý..." : "Thanh toán"}
          </button> */}
        </div>
      </div>
    </>
  );
};

export default Cart;
