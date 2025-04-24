// "use client";
// import { productsDummyData, userDummyData } from "@/assets/assets";
// import { useAuth, useUser } from "@clerk/nextjs";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { createContext, useContext, useEffect, useState } from "react";
// import toast from "react-hot-toast";

// export const AppContext = createContext();

// export const useAppContext = () => {
//   return useContext(AppContext);
// };

// export const AppContextProvider = (props) => {
//   const currency = process.env.NEXT_PUBLIC_CURRENCY;
//   const router = useRouter();

//   const { user } = useUser();
//   const { getToken } = useAuth();

//   const [products, setProducts] = useState([]);
//   const [userData, setUserData] = useState(null);
//   const [isSeller, setIsSeller] = useState(false);
//   const [cartItems, setCartItems] = useState({});

//   const fetchProductData = async () => {
//     try {
//       const { data } = await axios.get("/api/product/list");
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
//       if (user?.publicMetadata?.role === "seller") {
//         setIsSeller(true);
//       }
//       const token = await getToken();
//       const { data } = await axios.get("/api/user/data", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) {
//         setUserData(data.user);
//         setCartItems(data.user.cartItems || {});
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
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

//     if (user) {
//       try {
//         const token = await getToken();
//         await axios.post(
//           "/api/cart/update",
//           { cartData },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         toast.success("Item added to cart");
//       } catch (error) {
//         toast.error(error.message);
//       }
//     }
//   };

//   const updateCartQuantity = async (itemId, quantity) => {
//     let cartData = structuredClone(cartItems || {});
//     if (quantity === 0) {
//       delete cartData[itemId];
//     } else {
//       cartData[itemId] = quantity;
//     }
//     setCartItems(cartData);
//     if (user) {
//       try {
//         const token = await getToken();
//         await axios.post(
//           "/api/cart/update",
//           { cartData },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         toast.success("Cart Updated");
//       } catch (error) {
//         toast.error(error.message);
//       }
//     }
//   };

//   const getCartCount = () => {
//     let totalCount = 0;
//     for (const items in cartItems) {
//       if (cartItems[items] > 0) {
//         totalCount += cartItems[items];
//       }
//     }
//     return totalCount;
//   };

//   const getCartAmount = () => {
//     let totalAmount = 0;
//     for (const items in cartItems) {
//       let itemInfo = products.find((product) => product._id === items);
//       if (itemInfo && cartItems[items] > 0) {
//         totalAmount += itemInfo.offerPrice * cartItems[items];
//       }
//     }
//     return Math.floor(totalAmount * 100) / 100;
//   };

//   const deleteProduct = async (productId) => {
//     try {
//       const token = await getToken();
//       console.log("User token:", token); // Debug token
//       const userId = user?.id; // Lấy userId từ useUser
//       console.log("Current userId:", userId); // Debug userId
//       console.log("Deleting productId:", productId); // Debug productId

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
//     if (user) {
//       fetchUserData();
//     }
//   }, [user]);

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
//     deleteProduct, // Thêm deleteProduct vào value
//   };

//   return (
//     <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
//   );
// };
"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();

  const { user, isLoaded } = useUser(); // Thêm isLoaded
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});

  const formatCurrency = (amount) => {
    const roundedAmount = Math.floor(amount);
    const formattedAmount = roundedAmount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedAmount} ${currency}`;
  };

  const fetchProductData = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
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
      console.log("Token:", token);
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        router.push("/sign-in");
        return;
      }

      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Phản hồi từ /api/user/data:", data);
      if (data.success) {
        setUserData(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        if (data.message === "Người dùng không được tìm thấy") {
          toast.error(
            "Không tìm thấy thông tin người dùng. Vui lòng thử đăng nhập lại."
          );
          router.push("/sign-in");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Lỗi trong fetchUserData:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        router.push("/sign-in");
      } else {
        toast.error(error.message);
      }
    }
  };

  const addToCart = async (itemId) => {
    let cartData = structuredClone(cartItems || {});
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);

    if (user) {
      try {
        const token = await getToken();
        if (!token) {
          toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
          router.push("/sign-in");
          return;
        }
        await axios.post(
          "/api/cart/update",
          { cartData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Sản phẩm đã được thêm vào giỏ hàng");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems || {});
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
    if (user) {
      try {
        const token = await getToken();
        if (!token) {
          toast.error("Vui lòng đăng nhập để cập nhật giỏ hàng.");
          router.push("/sign-in");
          return;
        }
        await axios.post(
          "/api/cart/update",
          { cartData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Giỏ hàng đã được cập nhật");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo && cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return totalAmount;
  };

  const deleteProduct = async (productId) => {
    try {
      const token = await getToken();
      console.log("User token:", token);
      const userId = user?.id;
      console.log("Current userId:", userId);
      console.log("Deleting productId:", productId);

      if (!token) {
        toast.error("Vui lòng đăng nhập để xóa sản phẩm.");
        router.push("/sign-in");
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
    } else if (isLoaded && !user) {
      setUserData(null);
      setCartItems({});
      setIsSeller(false);
    }
  }, [user, isLoaded]); // Thêm isLoaded vào dependency array

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
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
