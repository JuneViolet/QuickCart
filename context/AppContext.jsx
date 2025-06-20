// "use client";
// import { useAuth, useUser } from "@clerk/nextjs";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { createContext, useContext, useEffect, useState, useRef } from "react";
// import toast from "react-hot-toast";

// export const AppContext = createContext();

// export const useAppContext = () => {
//   return useContext(AppContext);
// };

// export const AppContextProvider = (props) => {
//   const currency = process.env.NEXT_PUBLIC_CURRENCY || "VND";
//   const router = useRouter();

//   const { user, isLoaded } = useUser();
//   const { getToken } = useAuth();

//   const [products, setProducts] = useState([]);
//   const [userData, setUserData] = useState(null);
//   const [isSeller, setIsSeller] = useState(false);
//   const [cartItems, setCartItems] = useState({});
//   const [specifications, setSpecifications] = useState({});
//   const lastUpdateRef = useRef(null);
//   const [lastSyncedCart, setLastSyncedCart] = useState({});
//   const [shouldUpdateCart, setShouldUpdateCart] = useState(false);

//   useEffect(() => {
//     if (typeof window !== "undefined" && (!isLoaded || !user)) {
//       const savedCart = localStorage.getItem("cartItems");
//       if (savedCart) {
//         setCartItems(JSON.parse(savedCart));
//       } else {
//         setCartItems({});
//       }
//     }
//   }, [isLoaded, user]);

//   const formatCurrency = (amount) => {
//     const roundedAmount = Math.floor(amount);
//     const formattedAmount = roundedAmount
//       .toString()
//       .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
//     return `${formattedAmount} ${currency}`;
//   };

//   const fetchProductData = async () => {
//     try {
//       const token = await getToken();
//       const headers = token ? { Authorization: `Bearer ${token}` } : {};
//       const { data } = await axios.get("/api/product/list", { headers });
//       console.log("Client received:", data);
//       if (data.success) {
//         setProducts(data.products || data.product || []);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const fetchUserData = async () => {
//     try {
//       if (!isLoaded || !user) {
//         console.log("Đợi Clerk tải dữ liệu người dùng...");
//         return;
//       }
//       console.log("User từ Clerk:", user);
//       if (user?.publicMetadata?.role === "seller") {
//         setIsSeller(true);
//       } else {
//         setIsSeller(false);
//       }
//       const token = await getToken();
//       if (!token) {
//         console.log("No token available, skipping user data fetch");
//         return;
//       }
//       const { data } = await axios.get("/api/user/data", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("Phản hồi từ /api/user/data:", data);
//       if (data.success) {
//         setUserData(data.user);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error("Lỗi trong fetchUserData:", error);
//       toast.error(error.message);
//     }
//   };

//   const syncCart = async () => {
//     try {
//       const token = await getToken();
//       if (!token) {
//         console.log("No token available, skipping cart sync");
//         return;
//       }
//       const { data } = await axios.get("/api/cart", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("Sync Cart Response:", data);
//       if (data.success) {
//         const serverCart = data.cartItems || {};
//         setLastSyncedCart(structuredClone(serverCart));
//         setCartItems(serverCart);
//         if (typeof window !== "undefined") {
//           localStorage.setItem("cartItems", JSON.stringify(serverCart));
//         }
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error("Sync Cart Error:", error.message);
//       toast.error("Không thể đồng bộ giỏ hàng!");
//     }
//   };

//   const fetchSpecifications = async () => {
//     try {
//       const itemIds = Object.keys(cartItems);
//       if (itemIds.length === 0) {
//         setSpecifications({});
//         return;
//       }

//       const token = await getToken();
//       if (!token) {
//         console.log("No token available, skipping specifications fetch");
//         return;
//       }

//       const headers = token ? { Authorization: `Bearer ${token}` } : {};
//       const response = await axios.post(
//         "/api/specifications/list",
//         { productIds: itemIds },
//         { headers }
//       );

//       console.log("Specifications Response:", response.data);

//       if (response.data.success) {
//         const specs = response.data.specifications.reduce((acc, spec) => {
//           acc[spec.productId] = spec.specs;
//           return acc;
//         }, {});
//         setSpecifications(specs);
//       } else {
//         toast.error("Không thể lấy thông số kỹ thuật!");
//       }
//     } catch (error) {
//       console.error("Fetch Specifications Error:", error.message);
//       toast.error("Không thể lấy thông số kỹ thuật!");
//     }
//   };

//   const addToCart = async (itemId) => {
//     let cartData = structuredClone(cartItems || {});
//     if (cartData[itemId] && typeof cartData[itemId] === "object") {
//       cartData[itemId].quantity = (cartData[itemId].quantity || 0) + 1;
//     } else {
//       const product = products.find((p) => p._id === itemId);
//       if (product) {
//         cartData[itemId] = {
//           quantity: 1,
//           name: product.name,
//           price: product.offerPrice,
//           image: product.images[0],
//         };
//       }
//     }
//     setCartItems(cartData);
//     setShouldUpdateCart(true);
//   };

//   const updateCartQuantity = async (itemId, quantity) => {
//     let cartData = structuredClone(cartItems || {});
//     if (quantity === 0) {
//       delete cartData[itemId];
//     } else if (cartData[itemId] && typeof cartData[itemId] === "object") {
//       cartData[itemId].quantity = quantity;
//     } else {
//       const product = products.find((p) => p._id === itemId);
//       if (product) {
//         cartData[itemId] = {
//           quantity: quantity,
//           name: product.name,
//           price: product.offerPrice,
//           image: product.images[0],
//         };
//       }
//     }
//     setCartItems(cartData);
//     setShouldUpdateCart(true);
//   };

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("cartItems", JSON.stringify(cartItems));
//     }
//     fetchSpecifications();
//   }, [cartItems]);

//   useEffect(() => {
//     const handler = setTimeout(async () => {
//       if (user && shouldUpdateCart) {
//         const hasChanges =
//           JSON.stringify(cartItems) !== JSON.stringify(lastSyncedCart);
//         if (hasChanges) {
//           try {
//             const token = await getToken();
//             if (!token) return;
//             const currentTime = Date.now();
//             if (
//               lastUpdateRef.current &&
//               currentTime - lastUpdateRef.current < 1000
//             )
//               return;

//             const cartDataToSend = Object.fromEntries(
//               Object.entries(cartItems).map(([itemId, item]) => [
//                 itemId,
//                 item.quantity || 0,
//               ])
//             );

//             const { data } = await axios.post(
//               "/api/cart/update",
//               { cartData: cartDataToSend },
//               { headers: { Authorization: `Bearer ${token}` } }
//             );
//             console.log("Cart Data Sent:", cartDataToSend);
//             console.log("Update Cart Response:", data);
//             if (data.success) {
//               lastUpdateRef.current = currentTime;
//               setLastSyncedCart(structuredClone(cartItems));
//               toast.success("Giỏ hàng đã được cập nhật");
//               setShouldUpdateCart(false);
//               // Đồng bộ lại giỏ hàng sau khi cập nhật
//               await syncCart();
//             } else {
//               toast.error(data.message);
//             }
//           } catch (error) {
//             lastUpdateRef.current = null;
//             console.error("Update Cart Error:", error.message);
//             toast.error("Không thể cập nhật giỏ hàng!");
//           }
//         }
//       }
//     }, 1000);
//     return () => clearTimeout(handler);
//   }, [cartItems, user, getToken, shouldUpdateCart]);

//   const getCartCount = () => {
//     let totalCount = 0;
//     for (const itemId in cartItems) {
//       if (cartItems[itemId] && typeof cartItems[itemId] === "object") {
//         totalCount += cartItems[itemId].quantity || 0;
//       } else if (cartItems[itemId] > 0) {
//         totalCount += cartItems[itemId];
//       }
//     }
//     return totalCount;
//   };

//   const getCartAmount = () => {
//     let totalAmount = 0;
//     for (const itemId in cartItems) {
//       if (cartItems[itemId] && typeof cartItems[itemId] === "object") {
//         totalAmount +=
//           (cartItems[itemId].price || 0) * (cartItems[itemId].quantity || 0);
//       } else {
//         let itemInfo = products.find((product) => product._id === itemId);
//         if (itemInfo && cartItems[itemId] > 0) {
//           totalAmount += itemInfo.offerPrice * cartItems[itemId];
//         }
//       }
//     }
//     return totalAmount;
//   };

//   const deleteProduct = async (productId) => {
//     try {
//       const token = await getToken();
//       if (!token) {
//         console.log("No token available, skipping product deletion");
//         return;
//       }
//       const { data } = await axios.post(
//         "/api/product/delete",
//         { productId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (data.success) {
//         toast.success(data.message);
//         await fetchProductData();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error("Delete product error:", error);
//       toast.error(error.message);
//     }
//   };

//   useEffect(() => {
//     fetchProductData();
//   }, []);

//   useEffect(() => {
//     if (isLoaded && user) {
//       fetchUserData();
//       syncCart();
//     } else if (isLoaded && !user) {
//       setUserData(null);
//       setCartItems({});
//       setSpecifications({});
//       if (typeof window !== "undefined") {
//         localStorage.removeItem("cartItems");
//       }
//     }
//   }, [user, isLoaded]);

//   const value = {
//     user,
//     getToken,
//     currency,
//     router,
//     isSeller,
//     setIsSeller,
//     userData,
//     fetchUserData,
//     products,
//     fetchProductData,
//     cartItems,
//     setCartItems,
//     addToCart,
//     updateCartQuantity,
//     getCartCount,
//     getCartAmount,
//     deleteProduct,
//     formatCurrency,
//     specifications,
//   };

//   return (
//     <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
//   );
// };
"use client";
import mongoose from "mongoose";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "VND";
  const router = useRouter();

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [specifications, setSpecifications] = useState({});
  const [variants, setVariants] = useState({}); // Thêm state cho variants
  const lastUpdateRef = useRef(null);
  const [lastSyncedCart, setLastSyncedCart] = useState({});
  const [shouldUpdateCart, setShouldUpdateCart] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (!isLoaded || !user)) {
      const savedCart = localStorage.getItem("cartItems");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems({});
      }
    }
  }, [isLoaded, user]);

  const formatCurrency = (amount) => {
    const roundedAmount = Math.floor(amount);
    const formattedAmount = roundedAmount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedAmount} ${currency}`;
  };

  const fetchProductData = async () => {
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get("/api/product/list", { headers });
      console.log("Client received:", data);
      if (data.success) {
        setProducts(data.products || data.product || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUserData = async () => {
    try {
      if (!isLoaded || !user) {
        console.log("Đợi Clerk tải dữ liệu người dùng...");
        return;
      }
      console.log("User từ Clerk:", user);
      if (user?.publicMetadata?.role === "seller") {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
      const token = await getToken();
      if (!token) {
        console.log("No token available, skipping user data fetch");
        return;
      }
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Phản hồi từ /api/user/data:", data);
      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi trong fetchUserData:", error);
      toast.error(error.message);
    }
  };

  const syncCart = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.log("No token available, skipping cart sync");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const { data } = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Sync Cart Response:", data);
      if (data.success) {
        const serverCart = data.cartItems || {};
        setLastSyncedCart(structuredClone(serverCart));
        setCartItems(serverCart);
        if (typeof window !== "undefined") {
          localStorage.setItem("cartItems", JSON.stringify(serverCart));
        }
      } else {
        toast.error(data.message || "Không thể đồng bộ giỏ hàng!");
      }
    } catch (error) {
      console.error("Sync Cart Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(
        "Không thể đồng bộ giỏ hàng: " + (error.message || "Server error")
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
        console.warn("No valid product IDs found in cartItems:", itemIds);
        setSpecifications({});
        return;
      }

      const token = await getToken();
      if (!token) {
        console.log("No token available, skipping specifications fetch");
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(
        "/api/specifications/list",
        { productIds: validItemIds.map((id) => id.split("_")[0]) },
        { headers }
      );

      console.log("Specifications Response:", response.data);

      if (response.data.success) {
        const specs = response.data.specifications.reduce((acc, spec) => {
          acc[spec.productId] = spec.specs;
          return acc;
        }, {});
        setSpecifications(specs);
      } else {
        toast.error(
          response.data.message || "Không thể lấy thông số kỹ thuật!"
        );
      }
    } catch (error) {
      console.error("Fetch Specifications Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Không thể lấy thông số kỹ thuật: " + error.message);
    }
  };

  const fetchVariants = async () => {
    try {
      const itemIds = Object.keys(cartItems);
      if (itemIds.length === 0) {
        setVariants({});
        return;
      }

      const productIds = itemIds
        .map((id) => id.split("_")[0])
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (productIds.length === 0) {
        console.warn("No valid product IDs found for variants:", itemIds);
        setVariants({});
        return;
      }

      const token = await getToken();
      if (!token) {
        console.log("No token available, skipping variants fetch");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const variantPromises = productIds.map(async (productId) => {
        const response = await axios.get(`/api/product/${productId}`, {
          headers,
        });
        if (response.data.success) {
          return { [productId]: response.data.product.variants || [] };
        }
        return { [productId]: [] };
      });
      const variantResults = await Promise.all(variantPromises);
      const variantsData = variantResults.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      );
      setVariants(variantsData);
    } catch (error) {
      console.error("Fetch Variants Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Không thể lấy thông tin biến thể: " + error.message);
    }
  };

  const [isAdding, setIsAdding] = useState(false);

  const addToCart = async (productId, quantity = 1, variantId) => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Please log in to add to cart!");
        return;
      }

      if (
        !productId ||
        !variantId ||
        !mongoose.Types.ObjectId.isValid(productId) ||
        !mongoose.Types.ObjectId.isValid(variantId)
      ) {
        toast.error("Invalid product or variant ID!");
        return;
      }

      console.log("Adding to cart:", { productId, quantity, variantId });

      const itemKey = `${productId}_${variantId}`;
      const isExisting = cartItems[itemKey];
      const newQuantity = isExisting
        ? isExisting.quantity + quantity
        : quantity;

      const { data } = await axios.post(
        "/api/cart",
        { productId, quantity: newQuantity, variantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setCartItems(data.cartItems);
        if (typeof window !== "undefined") {
          localStorage.setItem("cartItems", JSON.stringify(data.cartItems));
        }
        if (!isExisting) {
          toast.success("Added to cart!");
        } else {
          toast.success("Quantity updated!");
        }
      } else {
        toast.error(data.message || "Failed to add to cart!");
      }
    } catch (error) {
      console.error("Add to Cart Error:", error.message);
      toast.error(
        `Error adding to cart: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsAdding(false);
    }
  };

  const updateCartQuantity = async (itemKey, quantity) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Please log in to update cart!");
        return;
      }
      const [productId, variantId] = itemKey.split("_");
      console.log("Updating cart:", {
        itemKey,
        productId,
        variantId,
        quantity,
      });
      const { data } = await axios.put(
        "/api/cart",
        { productId, variantId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setCartItems(data.cartItems);
        if (typeof window !== "undefined") {
          localStorage.setItem("cartItems", JSON.stringify(data.cartItems));
        }
        toast.success("Cart updated!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Update Cart Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Error updating cart: " + error.message);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
    fetchSpecifications();
    fetchVariants(); // Thêm fetch variants
  }, [cartItems]);

  const getCartCount = () => {
    let totalCount = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] && typeof cartItems[itemId] === "object") {
        totalCount += cartItems[itemId].quantity || 0;
      } else if (cartItems[itemId] > 0) {
        totalCount += cartItems[itemId];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] && typeof cartItems[itemId] === "object") {
        totalAmount +=
          (cartItems[itemId].price || 0) * (cartItems[itemId].quantity || 0);
      } else {
        let itemInfo = products.find((product) => product._id === itemId);
        if (itemInfo && cartItems[itemId] > 0) {
          totalAmount += itemInfo.offerPrice * cartItems[itemId];
        }
      }
    }
    return totalAmount;
  };

  const deleteProduct = async (productId) => {
    try {
      const token = await getToken();
      if (!token) {
        console.log("No token available, skipping product deletion");
        return;
      }
      const { data } = await axios.post(
        "/api/product/delete",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        await fetchProductData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error(error.message);
    }
  };

  const fetchAllVariants = async (productIds) => {
    try {
      const token = await getToken();
      if (!token) {
        console.log("No token available, skipping variants fetch");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const variantPromises = productIds.map(async (productId) => {
        const response = await axios.get(`/api/product/${productId}`, {
          headers,
        });
        if (response.data.success) {
          return { [productId]: response.data.product.variants || [] };
        }
        return { [productId]: [] };
      });
      const variantResults = await Promise.all(variantPromises);
      const variantsData = variantResults.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      );
      setVariants((prev) => ({ ...prev, ...variantsData }));
    } catch (error) {
      console.error("Fetch All Variants Error:", error.message);
      toast.error("Không thể lấy thông tin biến thể: " + error.message);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
      syncCart();
    } else if (isLoaded && !user) {
      setUserData(null);
      setCartItems({});
      setSpecifications({});
      setVariants({}); // Reset variants
      if (typeof window !== "undefined") {
        localStorage.removeItem("cartItems");
      }
    }
  }, [user, isLoaded]);

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
    fetchAllVariants,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
