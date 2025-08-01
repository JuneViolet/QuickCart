"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import mongoose from "mongoose";

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "VND";
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [specifications, setSpecifications] = useState({});
  const [variants, setVariants] = useState({});
  const lastUpdateRef = useRef(null);
  const [lastSyncedCart, setLastSyncedCart] = useState({});
  const [shouldUpdateCart, setShouldUpdateCart] = useState(false);

  // Khởi tạo giỏ hàng từ localStorage khi tải lần đầu
  useEffect(() => {
    if (typeof window !== "undefined" && (!isLoaded || !user)) {
      const savedCart = localStorage.getItem("cartItems");
      setCartItems(savedCart ? JSON.parse(savedCart) : {});
    }
  }, [isLoaded, user]);

  const formatCurrency = (amount) => {
    // Kiểm tra và xử lý giá trị không hợp lệ
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return `0 ${currency}`;
    }
    const roundedAmount = Math.floor(numericAmount);
    return `${roundedAmount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ${currency}`;
  };

  const fetchProductData = async () => {
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get("/api/product/list", { headers });
      if (data.success) setProducts(data.products || data.product || []);
      else toast.error(data.message || "Không thể tải sản phẩm!");
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error(
        "Lỗi tải sản phẩm: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const fetchUserData = async () => {
    if (!isLoaded || !user) {
      console.log("Đợi Clerk tải dữ liệu người dùng...");
      return;
    }
    try {
      setIsSeller(user?.publicMetadata?.role === "seller");
      const token = await getToken();
      if (!token) {
        console.log("Không có token, bỏ qua tải thông tin người dùng");
        return;
      }
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setUserData(data.user);
      else toast.error(data.message || "Không thể tải thông tin người dùng!");
    } catch (error) {
      console.error("Fetch user data error:", error);
      toast.error("Lỗi tải thông tin người dùng: " + error.message);
    }
  };

  const syncCart = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.log("Không có token, bỏ qua đồng bộ giỏ hàng");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay để tránh race condition
      const { data } = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const serverCart = data.cartItems || {};
        setLastSyncedCart(structuredClone(serverCart));
        setCartItems(serverCart);
        if (typeof window !== "undefined")
          localStorage.setItem("cartItems", JSON.stringify(serverCart));
      } else toast.error(data.message || "Không thể đồng bộ giỏ hàng!");
    } catch (error) {
      console.error("Sync cart error:", error);
      toast.error(
        "Lỗi đồng bộ giỏ hàng: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const fetchSpecifications = async () => {
    try {
      const itemIds = Object.keys(cartItems);
      if (itemIds.length === 0) {
        setSpecifications({});
        return;
      }
      const validItemIds = itemIds.filter((id) =>
        mongoose.Types.ObjectId.isValid(id.split("_")[0])
      );
      if (validItemIds.length === 0) {
        console.warn("Không tìm thấy ID sản phẩm hợp lệ:", itemIds);
        setSpecifications({});
        return;
      }
      const token = await getToken();
      if (!token) {
        console.log("Không có token, bỏ qua tải thông số kỹ thuật");
        return;
      }
      const { data } = await axios.post(
        "/api/specifications/list",
        { productIds: validItemIds.map((id) => id.split("_")[0]) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success)
        setSpecifications(
          data.specifications.reduce(
            (acc, spec) => ({ ...acc, [spec.productId]: spec.specs }),
            {}
          )
        );
      else toast.error(data.message || "Không thể tải thông số kỹ thuật!");
    } catch (error) {
      console.error("Fetch specifications error:", error);
      toast.error("Lỗi tải thông số kỹ thuật: " + error.message);
    }
  };

  const fetchVariants = async (
    productIds = Object.keys(cartItems).map((id) => id.split("_")[0])
  ) => {
    try {
      const validProductIds = productIds.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );
      if (validProductIds.length === 0) {
        console.warn(
          "Không tìm thấy ID sản phẩm hợp lệ cho variants:",
          productIds
        );
        setVariants({});
        return;
      }
      const token = await getToken();
      if (!token) {
        console.log("Không có token, bỏ qua tải variants");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const variantResults = await Promise.all(
        validProductIds.map(async (productId) => {
          const { data } = await axios.get(`/api/product/${productId}`, {
            headers,
          });
          return data.success
            ? { [productId]: data.product.variants || [] }
            : { [productId]: [] };
        })
      );
      setVariants((prev) => ({
        ...prev,
        ...variantResults.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
      }));
    } catch (error) {
      console.error("Fetch variants error:", error);
      toast.error("Lỗi tải thông tin biến thể: " + error.message);
    }
  };

  const [isAdding, setIsAdding] = useState(false);

  const addToCart = async (productId, quantity = 1, variantId) => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
        return;
      }
      if (
        !mongoose.Types.ObjectId.isValid(productId) ||
        !mongoose.Types.ObjectId.isValid(variantId)
      ) {
        toast.error("ID sản phẩm hoặc biến thể không hợp lệ!");
        return;
      }
      const itemKey = `${productId}_${variantId}`;
      const isExisting = cartItems[itemKey];
      const newQuantity = (isExisting?.quantity || 0) + quantity;
      const { data } = await axios.post(
        "/api/cart",
        { productId, quantity: newQuantity, variantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setCartItems(data.cartItems);
        if (typeof window !== "undefined")
          localStorage.setItem("cartItems", JSON.stringify(data.cartItems));

        // Handle warning messages for stock limits
        if (data.warning && data.message) {
          toast.success(
            isExisting ? "Số lượng đã cập nhật!" : "Đã thêm vào giỏ hàng!",
            { duration: 2000 }
          );
          // Show warning after success message
          setTimeout(() => {
            toast(
              (t) => (
                <div className="flex flex-col">
                  <div className="font-medium text-orange-600">
                    ⚠️ Thông báo tồn kho
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {data.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Bạn vẫn có thể đặt hàng, nhưng thời gian giao có thể lâu
                    hơn.
                  </div>
                </div>
              ),
              {
                duration: 6000,
                icon: "⚠️",
                style: {
                  borderLeft: "4px solid #f59e0b",
                  backgroundColor: "#fef3c7",
                },
              }
            );
          }, 500);
        } else {
          toast.success(
            isExisting ? "Số lượng đã cập nhật!" : "Đã thêm vào giỏ hàng!"
          );
        }
      } else toast.error(data.message || "Thêm vào giỏ hàng thất bại!");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(
        "Lỗi thêm vào giỏ hàng: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsAdding(false);
    }
  };

  const updateCartQuantity = async (itemKey, quantity) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập để cập nhật giỏ hàng!");
        return;
      }
      const [productId, variantId] = itemKey.split("_");
      const { data } = await axios.put(
        "/api/cart",
        { productId, variantId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setCartItems(data.cartItems);
        if (typeof window !== "undefined")
          localStorage.setItem("cartItems", JSON.stringify(data.cartItems));

        // Handle warning messages for stock limits
        if (data.warning && data.message) {
          toast.success("Giỏ hàng đã cập nhật!", { duration: 2000 });
          // Show warning after success message
          setTimeout(() => {
            toast(
              (t) => (
                <div className="flex flex-col">
                  <div className="font-medium text-orange-600">
                    ⚠️ Thông báo tồn kho
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {data.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Bạn vẫn có thể đặt hàng, nhưng thời gian giao có thể lâu
                    hơn.
                  </div>
                </div>
              ),
              {
                duration: 6000,
                icon: "⚠️",
                style: {
                  borderLeft: "4px solid #f59e0b",
                  backgroundColor: "#fef3c7",
                },
              }
            );
          }, 500);
        } else {
          toast.success("Giỏ hàng đã cập nhật!");
        }
      } else toast.error(data.message || "Cập nhật giỏ hàng thất bại!");
    } catch (error) {
      console.error("Update cart error:", error);
      toast.error("Lỗi cập nhật giỏ hàng: " + error.message);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    fetchSpecifications();
    fetchVariants();
  }, [cartItems]);

  const getCartCount = () => {
    return Object.values(cartItems).reduce(
      (total, item) => total + (item?.quantity || 0),
      0
    );
  };

  const getCartAmount = () => {
    return Object.values(cartItems).reduce((total, item) => {
      if (item && typeof item === "object" && item.quantity) {
        const productId =
          item.productId ||
          Object.keys(variants).find((id) =>
            variants[id].some((v) => v._id === item.variantId)
          );
        const variant = variants[productId]?.find(
          (v) => v._id === item.variantId
        );
        const price = variant?.offerPrice || 0;
        return total + price * item.quantity;
      }
      return total;
    }, 0);
  };

  const deleteProduct = async (productId) => {
    try {
      const token = await getToken();
      if (!token) {
        console.log("Không có token, bỏ qua xóa sản phẩm");
        return;
      }
      const { data } = await axios.post(
        "/api/product/delete",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchProductData();
      } else toast.error(data.message || "Xóa sản phẩm thất bại!");
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error("Lỗi xóa sản phẩm: " + error.message);
    }
  };

  useEffect(() => {
    fetchProductData();
    if (isLoaded) {
      if (user) {
        fetchUserData();
        syncCart();
      } else {
        setUserData(null);
        setCartItems({});
        setSpecifications({});
        setVariants({});
        if (typeof window !== "undefined") localStorage.removeItem("cartItems");
      }
    }
  }, [isLoaded, user]);

  const value = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    deleteProduct,
    formatCurrency,
    specifications,
    variants,
    fetchVariants,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
