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
//   const currency = process.env.NEXT_PUBLIC_CURRENCY;
//   const router = useRouter();

//   const { user, isLoaded } = useUser();
//   const { getToken } = useAuth();

//   const [products, setProducts] = useState([]);
//   const [userData, setUserData] = useState(null);
//   const [isSeller, setIsSeller] = useState(false);
//   const [cartItems, setCartItems] = useState(() => {
//     // Khôi phục từ localStorage khi khởi tạo
//     if (typeof window !== "undefined") {
//       const savedCart = localStorage.getItem("cartItems");
//       return savedCart ? JSON.parse(savedCart) : {};
//     }
//     return {};
//   });
//   const lastUpdateRef = useRef(null);

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

//       const { data } = await axios.get("/api/cart/get", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("Sync Cart Response:", data);
//       if (data.success) {
//         const serverCart = data.cartItems || {};
//         setCartItems((prev) => {
//           // Gộp dữ liệu từ server với localStorage, ưu tiên dữ liệu từ server
//           const mergedCart = { ...prev, ...serverCart };
//           localStorage.setItem("cartItems", JSON.stringify(mergedCart));
//           return mergedCart;
//         });
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error("Sync Cart Error:", error.message);
//       toast.error("Không thể đồng bộ giỏ hàng!");
//     }
//   };

//   const addToCart = async (itemId) => {
//     let cartData = structuredClone(cartItems || {});
//     if (cartData[itemId]) {
//       cartData[itemId] += 1;
//     } else {
//       cartData[itemId] = 1;
//     }
//     setCartItems(cartData);
//   };

//   const updateCartQuantity = async (itemId, quantity) => {
//     let cartData = structuredClone(cartItems || {});
//     if (quantity === 0) {
//       delete cartData[itemId];
//     } else {
//       cartData[itemId] = quantity;
//     }
//     setCartItems(cartData);
//   };

//   // Lưu cartItems vào localStorage mỗi khi thay đổi
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("cartItems", JSON.stringify(cartItems));
//     }
//   }, [cartItems]);

//   useEffect(() => {
//     const handler = setTimeout(async () => {
//       if (user && Object.keys(cartItems).length > 0) {
//         try {
//           const token = await getToken();
//           if (!token) return;
//           const currentTime = Date.now();
//           if (
//             lastUpdateRef.current &&
//             currentTime - lastUpdateRef.current < 1000
//           )
//             return;
//           const { data } = await axios.post(
//             "/api/cart/update",
//             { cartData: cartItems },
//             { headers: { Authorization: `Bearer ${token}` } }
//           );
//           console.log("Update Cart Response:", data);
//           if (data.success) {
//             lastUpdateRef.current = currentTime;
//             toast.success("Giỏ hàng đã được cập nhật");
//           }
//         } catch (error) {
//           toast.error(error.message);
//         }
//       }
//     }, 500);
//     return () => clearTimeout(handler);
//   }, [cartItems, user, getToken]);

//   const getCartCount = () => {
//     let totalCount = 0;
//     for (const itemId in cartItems) {
//       if (cartItems[itemId] > 0) {
//         totalCount += cartItems[itemId];
//       }
//     }
//     return totalCount;
//   };

//   const getCartAmount = () => {
//     let totalAmount = 0;
//     for (const itemId in cartItems) {
//       let itemInfo = products.find((product) => product._id === itemId);
//       if (itemInfo && cartItems[itemId] > 0) {
//         totalAmount += itemInfo.offerPrice * cartItems[itemId];
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
//       localStorage.removeItem("cartItems"); // Xóa localStorage nếu không có người dùng
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
//   };

//   return (
//     <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
//   );
// };
"use client";
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
  const [specifications, setSpecifications] = useState({}); // Thêm state cho specifications
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
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Sync Cart Error:", error.message);
      toast.error("Không thể đồng bộ giỏ hàng!");
    }
  };

  const fetchSpecifications = async () => {
    try {
      const itemIds = Object.keys(cartItems);
      if (itemIds.length === 0) {
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
        { productIds: itemIds },
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
        toast.error("Không thể lấy thông số kỹ thuật!");
      }
    } catch (error) {
      console.error("Fetch Specifications Error:", error.message);
      toast.error("Không thể lấy thông số kỹ thuật!");
    }
  };

  const addToCart = async (itemId) => {
    let cartData = structuredClone(cartItems || {});
    if (cartData[itemId] && typeof cartData[itemId] === "object") {
      cartData[itemId].quantity = (cartData[itemId].quantity || 0) + 1;
    } else {
      const product = products.find((p) => p._id === itemId);
      if (product) {
        cartData[itemId] = {
          quantity: 1,
          name: product.name,
          price: product.offerPrice,
          image: product.images[0],
        };
      }
    }
    setCartItems(cartData);
    setShouldUpdateCart(true);
  };

  const updateCartQuantity = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems || {});
    if (quantity === 0) {
      delete cartData[itemId];
    } else if (cartData[itemId] && typeof cartData[itemId] === "object") {
      cartData[itemId].quantity = quantity;
    } else {
      const product = products.find((p) => p._id === itemId);
      if (product) {
        cartData[itemId] = {
          quantity: quantity,
          name: product.name,
          price: product.offerPrice,
          image: product.images[0],
        };
      }
    }
    setCartItems(cartData);
    setShouldUpdateCart(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
    fetchSpecifications(); // Gọi fetchSpecifications khi cartItems thay đổi
  }, [cartItems]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (user && Object.keys(cartItems).length > 0 && shouldUpdateCart) {
        const hasChanges =
          JSON.stringify(cartItems) !== JSON.stringify(lastSyncedCart);
        if (hasChanges) {
          try {
            const token = await getToken();
            if (!token) return;
            const currentTime = Date.now();
            if (
              lastUpdateRef.current &&
              currentTime - lastUpdateRef.current < 1000
            )
              return;

            const cartDataToSend = Object.fromEntries(
              Object.entries(cartItems).map(([itemId, item]) => [
                itemId,
                item.quantity || 0,
              ])
            );

            const { data } = await axios.post(
              "/api/cart/update",
              { cartData: cartDataToSend },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Cart Data Sent:", cartDataToSend);
            console.log("Update Cart Response:", data);
            if (data.success) {
              lastUpdateRef.current = currentTime;
              setLastSyncedCart(structuredClone(cartItems));
              toast.success("Giỏ hàng đã được cập nhật");
              setShouldUpdateCart(false);
            } else {
              toast.error(data.message);
            }
          } catch (error) {
            lastUpdateRef.current = null;
            console.error("Update Cart Error:", error.message);
            toast.error("Không thể cập nhật giỏ hàng!");
          }
        }
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [cartItems, user, getToken, shouldUpdateCart]);

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
      setSpecifications({}); // Reset specifications khi không có user
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
    specifications, // Thêm specifications vào context
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
