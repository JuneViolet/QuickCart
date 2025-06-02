// "use client";
// import React, { useEffect, useState } from "react";
// import { assets } from "@/assets/assets";
// import OrderSummary from "@/components/OrderSummary";
// import Image from "next/image";
// import Navbar from "@/components/Navbar";
// import { useAppContext } from "@/context/AppContext";
// import axios from "axios";
// import Link from "next/link";
// import toast from "react-hot-toast";
// import { useUser } from "@clerk/nextjs";

// const Cart = () => {
//   const {
//     router,
//     cartItems,
//     setCartItems,
//     addToCart,
//     updateCartQuantity,
//     getCartCount,
//     formatCurrency,
//     getToken,
//   } = useAppContext();
//   const { isSignedIn } = useUser();
//   const [shippingFee, setShippingFee] = useState(null);
//   const [defaultAddress, setDefaultAddress] = useState(null);

//   useEffect(() => {
//     if (!isSignedIn) {
//       console.log("User not signed in, skipping cart page");
//       return;
//     }

//     const fetchDefaultAddress = async () => {
//       try {
//         const token = await getToken();
//         const headers = token ? { Authorization: `Bearer ${token}` } : {};
//         const { data } = await axios.get("/api/address/default", { headers });
//         if (data.success) {
//           setDefaultAddress(data.address);
//           if (!data.address) {
//             toast.error(
//               "Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ!"
//             );
//             router.push("/add-address");
//           }
//         } else {
//           toast.error(data.message);
//         }
//       } catch (error) {
//         console.error("Fetch Default Address Error:", error.message);
//         toast.error("Không thể lấy địa chỉ mặc định. Vui lòng thử lại!");
//       }
//     };

//     fetchDefaultAddress();
//   }, [isSignedIn, getToken, router]);

//   useEffect(() => {
//     const calculateShippingFee = async () => {
//       if (!defaultAddress || Object.keys(cartItems).length === 0) return;

//       try {
//         const totalWeight = Object.values(cartItems).reduce((sum, item) => {
//           const product = cartItems[item]; // Lấy dữ liệu từ cartItems
//           const weightSpec = product.specifications?.find(
//             (spec) => spec.key.toLowerCase() === "trọng lượng"
//           );
//           let weight = 0.5; // Giá trị mặc định nếu không tìm thấy
//           if (weightSpec) {
//             const weightValue = parseFloat(
//               weightSpec.value.replace(/[^0-9.]/g, "")
//             );
//             weight = weightValue / 1000; // Chuyển từ gram sang kg
//           }
//           const quantity = item.quantity || 1;
//           console.log(
//             `Product: ${
//               product.name
//             }, Weight: ${weight}kg, Quantity: ${quantity}, Subtotal Weight: ${
//               weight * quantity
//             }kg`
//           );
//           return sum + weight * quantity;
//         }, 0);

//         const totalValue = Object.values(cartItems).reduce(
//           (sum, item) => sum + (item.offerPrice || 0) * item.quantity,
//           0
//         );

//         console.log("Total Weight Calculated:", totalWeight, "kg");
//         console.log("Total Value Calculated:", totalValue, "VNĐ");

//         const payload = {
//           pick_province: "TP. Hồ Chí Minh",
//           pick_district: "Quận 3",
//           province: defaultAddress.city || "TP. Hồ Chí Minh",
//           district: defaultAddress.state || "Quận 1",
//           address: defaultAddress.area || "123 Nguyễn Chí Thanh",
//           weight: totalWeight,
//           value: totalValue,
//           transport: "road",
//           deliver_option: "none",
//           products: Object.values(cartItems).map((item) => ({
//             name: item.name,
//             weight: 0.5, // Giá trị mặc định, cần điều chỉnh nếu có spec
//             quantity: item.quantity || 1,
//           })),
//         };

//         console.log("Payload sent to GHTK:", payload);

//         const token = await getToken();
//         const headers = token ? { Authorization: `Bearer ${token}` } : {};
//         const response = await axios.post(
//           "/api/ghtk",
//           {
//             action: "calculateFee",
//             payload,
//           },
//           { headers }
//         );

//         setShippingFee(response.data.data.fee.fee);
//         console.log("Shipping Fee Calculated:", response.data.data.fee.fee);
//       } catch (error) {
//         console.error("Calculate Shipping Fee Error:", error.message);
//         setShippingFee(0);
//         toast.error("Không thể tính phí vận chuyển!");
//       }
//     };

//     calculateShippingFee();
//   }, [defaultAddress, cartItems, getToken]);

//   useEffect(() => {
//     console.log("Shipping Fee State Updated in Cart:", shippingFee);
//   }, [shippingFee]);

//   useEffect(() => {
//     console.log("Cart Items:", cartItems);
//   }, [cartItems]);

//   useEffect(() => {
//     console.log("Cart Items in Cart Page:", cartItems);
//   }, [cartItems]);
//   return (
//     <>
//       <Navbar />
//       <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
//         <div className="flex-1">
//           <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
//             <p className="text-2xl md:text-3xl text-gray-500">
//               Giỏ <span className="font-medium text-orange-600">Hàng</span>
//             </p>
//             <p className="text-lg md:text-xl text-gray-500/80">
//               {getCartCount()} Sản Phẩm
//             </p>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="min-w-full table-auto">
//               <thead className="text-left">
//                 <tr>
//                   <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
//                     Chi Tiết Sản Phẩm
//                   </th>
//                   <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
//                     Giá
//                   </th>
//                   <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
//                     Số Lượng
//                   </th>
//                   <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
//                     Tổng Cộng
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {Object.entries(cartItems).map(([itemId, item]) => (
//                   <tr key={itemId}>
//                     <td className="flex items-center gap-4 py-4 md:px-4 px-1">
//                       <div>
//                         <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
//                           {item.image ? (
//                             <Image
//                               src={item.image}
//                               alt={item.name}
//                               className="w-16 h-auto object-cover mix-blend-multiply"
//                               width={1280}
//                               height={720}
//                             />
//                           ) : (
//                             <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
//                               <span className="text-gray-500">No Image</span>
//                             </div>
//                           )}
//                         </div>
//                         <button
//                           className="md:hidden text-xs text-orange-600 mt-1"
//                           onClick={() => updateCartQuantity(itemId, 0)}
//                         >
//                           Remove
//                         </button>
//                       </div>
//                       <div className="text-sm hidden md:block">
//                         <p className="text-gray-800">{item.name}</p>
//                         <button
//                           className="text-xs text-orange-600 mt-1"
//                           onClick={() => updateCartQuantity(itemId, 0)}
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </td>
//                     <td className="py-4 md:px-4 px-1 text-gray-600">
//                       {formatCurrency(item.price)}
//                     </td>
//                     <td className="py-4 md:px-4 px-1">
//                       <div className="flex items-center md:gap-2 gap-1">
//                         <button
//                           onClick={() =>
//                             updateCartQuantity(itemId, item.quantity - 1)
//                           }
//                         >
//                           <Image
//                             src={assets.decrease_arrow}
//                             alt="decrease_arrow"
//                             className="w-4 h-4"
//                           />
//                         </button>
//                         <input
//                           onChange={(e) =>
//                             updateCartQuantity(itemId, Number(e.target.value))
//                           }
//                           type="number"
//                           value={item.quantity}
//                           className="w-8 border text-center appearance-none"
//                         />
//                         <button onClick={() => addToCart(itemId)}>
//                           <Image
//                             src={assets.increase_arrow}
//                             alt="increase_arrow"
//                             className="w-4 h-4"
//                           />
//                         </button>
//                       </div>
//                     </td>
//                     <td className="py-4 md:px-4 px-1 text-gray-600">
//                       {formatCurrency(item.price * item.quantity)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <button
//             onClick={() => router.push("/all-products")}
//             className="group flex items-center mt-6 gap-2 text-orange-600"
//           >
//             <Image
//               className="group-hover:-translate-x-1 transition"
//               src={assets.arrow_right_icon_colored}
//               alt="arrow_right_icon_colored"
//             />
//             Tiếp Tục Shopping
//           </button>
//         </div>
//         <div>
//           <OrderSummary shippingFee={shippingFee} />
//           <Link href="/checkout">
//             <button className="mt-4 w-full px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
//               Thanh Toán
//             </button>
//           </Link>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Cart;
// "use client";
// import React, { useEffect, useState } from "react";
// import { assets } from "@/assets/assets";
// import OrderSummary from "@/components/OrderSummary";
// import Image from "next/image";
// import Navbar from "@/components/Navbar";
// import { useAppContext } from "@/context/AppContext";
// import axios from "axios";
// import Link from "next/link";
// import toast from "react-hot-toast";
// import { useUser } from "@clerk/nextjs";

// const Cart = () => {
//   const {
//     router,
//     cartItems,
//     setCartItems,
//     addToCart,
//     updateCartQuantity,
//     getCartCount,
//     formatCurrency,
//     getToken,
//   } = useAppContext();
//   const { isSignedIn } = useUser();
//   const [shippingFee, setShippingFee] = useState(null);
//   const [defaultAddress, setDefaultAddress] = useState(null);
//   const [specifications, setSpecifications] = useState({});

//   useEffect(() => {
//     if (!isSignedIn) {
//       console.log("User not signed in, skipping cart page");
//       return;
//     }

//     const fetchDefaultAddress = async () => {
//       try {
//         const token = await getToken();
//         const headers = token ? { Authorization: `Bearer ${token}` } : {};
//         const { data } = await axios.get("/api/address/default", { headers });
//         if (data.success) {
//           setDefaultAddress(data.address);
//           if (!data.address) {
//             toast.error(
//               "Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ!"
//             );
//             router.push("/add-address");
//           }
//         } else {
//           toast.error(data.message);
//         }
//       } catch (error) {
//         console.error("Fetch Default Address Error:", error.message);
//         toast.error("Không thể lấy địa chỉ mặc định. Vui lòng thử lại!");
//       }
//     };

//     fetchDefaultAddress();
//   }, [isSignedIn, getToken, router]);

//   useEffect(() => {
//     const fetchSpecifications = async () => {
//       try {
//         const itemIds = Object.keys(cartItems);
//         if (itemIds.length === 0) {
//           setSpecifications({});
//           return;
//         }

//         const token = await getToken();
//         const headers = token ? { Authorization: `Bearer ${token}` } : {};
//         const response = await axios.post(
//           "/api/specifications/list",
//           { productIds: itemIds },
//           { headers }
//         );

//         console.log("Specifications Response:", response.data);

//         if (response.data.success) {
//           const specs = response.data.specifications.reduce((acc, spec) => {
//             acc[spec.productId] = spec.specs;
//             return acc;
//           }, {});
//           setSpecifications(specs);
//         } else {
//           toast.error("Không thể lấy thông số kỹ thuật!");
//         }
//       } catch (error) {
//         console.error("Fetch Specifications Error:", error.message);
//         toast.error("Không thể lấy thông số kỹ thuật!");
//       }
//     };

//     fetchSpecifications();
//   }, [cartItems, getToken]);

//   useEffect(() => {
//     const calculateShippingFee = async () => {
//       if (!defaultAddress || !defaultAddress.city || !defaultAddress.state || !defaultAddress.area || Object.keys(cartItems).length === 0) {
//         console.log(
//           "Skipping shipping fee calculation: No valid address or cart items"
//         );
//         return;
//       }

//       const itemIds = Object.keys(cartItems);
//       if (itemIds.some((id) => !specifications[id] || !specifications[id].length)) {
//         console.log(
//           "Skipping shipping fee calculation: Specifications not fully fetched"
//         );
//         return;
//       }

//       try {
//         const totalWeight = Object.values(cartItems).reduce((sum, item) => {
//           const productId = Object.keys(cartItems).find(
//             (key) => cartItems[key] === item
//           );
//           const specs = specifications[productId] || [];
//           let weight = 0.5;

//           const weightSpec = specs.find(
//             (s) => s.key.toLowerCase() === "trọng lượng"
//           );
//           if (weightSpec) {
//             const weightValue = parseFloat(
//               weightSpec.value.replace(/[^0-9.]/g, "")
//             );
//             if (!isNaN(weightValue)) {
//               weight = weightValue / 1000;
//             } else {
//               console.warn(
//                 `Invalid weight value for ${item.name}: ${weightSpec.value}`
//               );
//             }
//           } else {
//             console.warn(
//               `No weight spec found for ${item.name}, using default 0.5kg`
//             );
//           }

//           const quantity = item.quantity || 1;
//           console.log(
//             `Product: ${item.name}, Weight: ${weight}kg, Quantity: ${quantity}, Subtotal Weight: ${weight * quantity}kg`
//           );
//           return sum + weight * quantity;
//         }, 0);

//         console.log("Total Weight Calculated:", totalWeight, "kg");

//         if (totalWeight <= 0) {
//           throw new Error("Total weight must be greater than 0");
//         }

//         const totalValue = Object.values(cartItems).reduce(
//           (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
//           0
//         );

//         console.log("Total Value Calculated:", totalValue, "VNĐ");

//         const payload = {
//           pick_province: "TP. Hồ Chí Minh",
//           pick_district: "Quận 3",
//           pick_address: "123 Đường Lấy Hàng, Quận 3",
//           province: defaultAddress.city || "TP. Hồ Chí Minh",
//           district: defaultAddress.state.startsWith("Quận ")
//             ? defaultAddress.state
//             : `Quận ${defaultAddress.state}` || "Quận 1",
//           ward: defaultAddress.ward?.startsWith("Phường ")
//             ? defaultAddress.ward
//             : `Phường ${defaultAddress.ward || "1"}`,
//           address: defaultAddress.area || "123 Nguyễn Chí Thanh",
//           weight: totalWeight,
//           value: totalValue,
//           transport: "road",
//           deliver_option: "none",
//           products: Object.values(cartItems).map((item) => {
//             const productId = Object.keys(cartItems).find(
//               (key) => cartItems[key] === item
//             );
//             const specs = specifications[productId] || [];
//             let weight = 0.5;
//             const weightSpec = specs.find(
//               (s) => s.key.toLowerCase() === "trọng lượng"
//             );
//             if (weightSpec) {
//               const weightValue = parseFloat(
//                 weightSpec.value.replace(/[^0-9.]/g, "")
//               );
//               if (!isNaN(weightValue)) {
//                 weight = weightValue / 1000;
//               }
//             }
//             return {
//               name: item.name,
//               weight: weight,
//               quantity: item.quantity || 1,
//             };
//           }),
//         };

//         console.log("Payload sent to GHTK:", JSON.stringify(payload, null, 2));

//         const token = await getToken();
//         const headers = token ? { Authorization: `Bearer ${token}` } : {};
//         const response = await axios.post(
//           "/api/ghtk",
//           {
//             action: "calculateFee",
//             payload,
//           },
//           { headers }
//         );

//         if (!response.data) {
//           throw new Error("GHTK response is empty");
//         }

//         console.log("GHTK Response:", JSON.stringify(response.data, null, 2));
//         if (response.data.success && response.data.data?.success && response.data.data?.fee?.fee) {
//           setShippingFee(response.data.data.fee.fee);
//           console.log("Shipping Fee Calculated:", response.data.data.fee.fee);
//         } else {
//           const errorMessage =
//             response.data.success === false || !response.data.data?.success
//               ? response.data.data?.message || response.data.message || "GHTK failed to calculate fee"
//               : "Invalid GHTK response structure";
//           console.log("GHTK Error Response:", JSON.stringify(response.data, null, 2));
//           throw new Error(errorMessage);
//         }
//       } catch (error) {
//         console.error("Calculate Shipping Fee Error:", error.message);
//         setShippingFee(0);
//         toast.error("Không thể tính phí vận chuyển: " + error.message);
//       }
//     };

//     calculateShippingFee();
//   }, [defaultAddress, cartItems, specifications, getToken]);

//   useEffect(() => {
//     console.log("Shipping Fee State Updated in Cart:", shippingFee);
//   }, [shippingFee]);

//   useEffect(() => {
//     console.log("Cart Items:", cartItems);
//   }, [cartItems]);

//   useEffect(() => {
//     console.log("Cart Items in Cart Page:", JSON.stringify(cartItems, null, 2));
//     console.log("Specifications fetched:", JSON.stringify(specifications, null, 2));
//   }, [cartItems, specifications]);

//   return (
//     <>
//       <Navbar />
//       <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
//         <div className="flex-1">
//           <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
//             <p className="text-2xl md:text-3xl text-gray-500">
//               Giỏ <span className="font-medium text-orange-600">Hàng</span>
//             </p>
//             <p className="text-lg md:text-xl text-gray-500/80">
//               {getCartCount()} Sản Phẩm
//             </p>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="min-w-full table-auto">
//               <thead className="text-left">
//                 <tr>
//                   <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
//                     Chi Tiết Sản Phẩm
//                   </th>
//                   <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
//                     Giá
//                   </th>
//                   <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
//                     Số Lượng
//                   </th>
//                   <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
//                     Tổng Cộng
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {Object.entries(cartItems).map(([itemId, item]) => (
//                   <tr key={itemId}>
//                     <td className="flex items-center gap-4 py-4 md:px-4 px-1">
//                       <div>
//                         <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
//                           {item.image ? (
//                             <Image
//                               src={item.image}
//                               alt={item.name}
//                               className="w-16 h-auto object-cover mix-blend-multiply"
//                               width={1280}
//                               height={720}
//                             />
//                           ) : (
//                             <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
//                               <span className="text-gray-500">No Image</span>
//                             </div>
//                           )}
//                         </div>
//                         <button
//                           className="md:hidden text-xs text-orange-600 mt-1"
//                           onClick={() => updateCartQuantity(itemId, 0)}
//                         >
//                           Remove
//                         </button>
//                       </div>
//                       <div className="text-sm hidden md:block">
//                         <p className="text-gray-800">{item.name}</p>
//                         <button
//                           className="text-xs text-orange-600 mt-1"
//                           onClick={() => updateCartQuantity(itemId, 0)}
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </td>
//                     <td className="py-4 md:px-4 px-1 text-gray-600">
//                       {formatCurrency(item.price)}
//                     </td>
//                     <td className="py-4 md:px-4 px-1">
//                       <div className="flex items-center md:gap-2 gap-1">
//                         <button
//                           onClick={() =>
//                             updateCartQuantity(itemId, item.quantity - 1)
//                           }
//                         >
//                           <Image
//                             src={assets.decrease_arrow}
//                             alt="decrease_arrow"
//                             className="w-4 h-4"
//                           />
//                         </button>
//                         <input
//                           onChange={(e) =>
//                             updateCartQuantity(itemId, Number(e.target.value))
//                           }
//                           type="number"
//                           value={item.quantity}
//                           className="w-8 border text-center appearance-none"
//                         />
//                         <button onClick={() => addToCart(itemId)}>
//                           <Image
//                             src={assets.increase_arrow}
//                             alt="increase_arrow"
//                             className="w-4 h-4"
//                           />
//                         </button>
//                       </div>
//                     </td>
//                     <td className="py-4 md:px-4 px-1 text-gray-600">
//                       {formatCurrency(item.price * item.quantity)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <button
//             onClick={() => router.push("/all-products")}
//             className="group flex items-center mt-6 gap-2 text-orange-600"
//           >
//             <Image
//               className="group-hover:-translate-x-1 transition"
//               src={assets.arrow_right_icon_colored}
//               alt="arrow_right_icon_colored"
//             />
//             Tiếp Tục Shopping
//           </button>
//         </div>
//         <div>
//           <OrderSummary shippingFee={shippingFee} />
//           <Link href="/checkout">
//             <button className="mt-4 w-full px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
//               Thanh Toán
//             </button>
//           </Link>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Cart;
"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

const Cart = () => {
  const {
    router,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    formatCurrency,
    getToken,
  } = useAppContext();
  const { isSignedIn } = useUser();
  const [shippingFee, setShippingFee] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [specifications, setSpecifications] = useState({});

  useEffect(() => {
    if (!isSignedIn) {
      console.log("User not signed in, skipping cart page");
      return;
    }

    const fetchDefaultAddress = async () => {
      try {
        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await axios.get("/api/address/default", { headers });
        if (data.success) {
          if (data.address) {
            setDefaultAddress(data.address);
          } else {
            toast.error(
              "Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ!"
            );
            router.push("/add-address");
          }
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Fetch Default Address Error:", error.message);
        toast.error("Không thể lấy địa chỉ mặc định. Vui lòng thử lại!");
      }
    };

    fetchDefaultAddress();
  }, [isSignedIn, getToken, router]);

  useEffect(() => {
    const fetchSpecifications = async () => {
      try {
        const itemIds = Object.keys(cartItems);
        if (itemIds.length === 0) {
          setSpecifications({});
          return;
        }

        const token = await getToken();
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

    fetchSpecifications();
  }, [cartItems, getToken]);

  useEffect(() => {
    const calculateShippingFee = async () => {
      if (
        !defaultAddress ||
        !defaultAddress.city ||
        !defaultAddress.state ||
        !defaultAddress.area ||
        Object.keys(cartItems).length === 0
      ) {
        console.log(
          "Skipping shipping fee calculation: No valid address or cart items"
        );
        return;
      }

      const itemIds = Object.keys(cartItems);
      if (
        itemIds.some((id) => !specifications[id] || !specifications[id].length)
      ) {
        console.log(
          "Skipping shipping fee calculation: Specifications not fully fetched"
        );
        return;
      }

      try {
        const totalWeight = Object.values(cartItems).reduce((sum, item) => {
          const productId = Object.keys(cartItems).find(
            (key) => cartItems[key] === item
          );
          const specs = specifications[productId] || [];
          let weight = 500; // Mặc định 500g

          const weightSpec = specs.find(
            (s) => s.key.toLowerCase() === "trọng lượng"
          );
          if (weightSpec) {
            const weightValue = parseFloat(
              weightSpec.value.replace(/[^0-9.]/g, "")
            );
            if (!isNaN(weightValue)) {
              weight = Math.max(weightValue, 1000); // Đảm bảo tối thiểu 1000g
            } else {
              console.warn(
                `Invalid weight value for ${item.name}: ${weightSpec.value}`
              );
            }
          } else {
            console.warn(
              `No weight spec found for ${item.name}, using default 500g`
            );
          }

          const quantity = item.quantity || 1;
          console.log(
            `Product: ${
              item.name
            }, Weight: ${weight}g, Quantity: ${quantity}, Subtotal Weight: ${
              weight * quantity
            }g`
          );
          return sum + weight * quantity;
        }, 0);

        console.log("Total Weight Calculated:", totalWeight, "g");

        if (totalWeight <= 0) {
          throw new Error("Total weight must be greater than 0");
        }

        const totalValue = Object.values(cartItems).reduce(
          (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
          0
        );

        console.log("Total Value Calculated:", totalValue, "VNĐ");

        const payload = {
          pick_province: "TP. Hồ Chí Minh", // Cần lấy từ thông tin cửa hàng thực tế
          pick_district: "Quận 3",
          pick_address: "123 Đường Lấy Hàng, Quận 3",
          province:
            defaultAddress.city === "Hồ Chí Minh"
              ? "TP. Hồ Chí Minh"
              : defaultAddress.city || "TP. Hồ Chí Minh",
          district: defaultAddress.state.startsWith("Quận ")
            ? defaultAddress.state
            : `Quận ${defaultAddress.state}` || "Quận 1",
          ward: defaultAddress.ward?.startsWith("Phường ")
            ? defaultAddress.ward
            : `Phường ${defaultAddress.ward || "1"}`,
          address: defaultAddress.area || "123 Nguyễn Chí Thanh",
          weight: totalWeight, // Đã ở dạng gram
          value: totalValue,
          transport: "road",
          deliver_option: "none",
          products: Object.values(cartItems).map((item) => {
            const productId = Object.keys(cartItems).find(
              (key) => cartItems[key] === item
            );
            const specs = specifications[productId] || [];
            let weight = 500;
            const weightSpec = specs.find(
              (s) => s.key.toLowerCase() === "trọng lượng"
            );
            if (weightSpec) {
              const weightValue = parseFloat(
                weightSpec.value.replace(/[^0-9.]/g, "")
              );
              if (!isNaN(weightValue)) {
                weight = Math.max(weightValue, 1000);
              }
            }
            return {
              name: item.name,
              weight: weight,
              quantity: item.quantity || 1,
            };
          }),
        };

        console.log("Payload sent to GHTK:", JSON.stringify(payload, null, 2));

        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.post(
          "/api/ghtk",
          {
            action: "calculateFee",
            payload,
          },
          { headers }
        );

        if (!response.data) {
          throw new Error("GHTK response is empty");
        }

        console.log(
          "GHTK Response from Client:",
          JSON.stringify(response.data, null, 2)
        );
        if (response.data.success && response.data.data?.success) {
          if (response.data.data.fee?.fee) {
            setShippingFee(response.data.data.fee.fee);
            console.log("Shipping Fee Calculated:", response.data.data.fee.fee);
          } else {
            throw new Error("GHTK response missing fee data");
          }
        } else {
          const errorMessage =
            response.data.data?.message ||
            response.data.message ||
            "GHTK failed to calculate fee";
          console.log(
            "GHTK Error Response:",
            JSON.stringify(response.data, null, 2)
          );
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error("Calculate Shipping Fee Error:", error.message);
        setShippingFee(0);
        toast.error("Không thể tính phí vận chuyển: " + error.message);
      }
    };

    calculateShippingFee();
  }, [defaultAddress, cartItems, specifications, getToken]);

  useEffect(() => {
    console.log("Shipping Fee State Updated in Cart:", shippingFee);
  }, [shippingFee]);

  useEffect(() => {
    console.log("Cart Items:", cartItems);
  }, [cartItems]);

  useEffect(() => {
    console.log("Cart Items in Cart Page:", JSON.stringify(cartItems, null, 2));
    console.log(
      "Specifications fetched:",
      JSON.stringify(specifications, null, 2)
    );
  }, [cartItems, specifications]);

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
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Giá
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Số Lượng
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Tổng Cộng
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(cartItems).map(([itemId, item]) => (
                  <tr key={itemId}>
                    <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                      <div>
                        <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-auto object-cover mix-blend-multiply"
                              width={1280}
                              height={720}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">No Image</span>
                            </div>
                          )}
                        </div>
                        <button
                          className="md:hidden text-xs text-orange-600 mt-1"
                          onClick={() => updateCartQuantity(itemId, 0)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-sm hidden md:block">
                        <p className="text-gray-800">{item.name}</p>
                        <button
                          className="text-xs text-orange-600 mt-1"
                          onClick={() => updateCartQuantity(itemId, 0)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                    <td className="py-4 md:px-4 px-1 text-gray-600">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-4 md:px-4 px-1">
                      <div className="flex items-center md:gap-2 gap-1">
                        <button
                          onClick={() =>
                            updateCartQuantity(itemId, item.quantity - 1)
                          }
                        >
                          <Image
                            src={assets.decrease_arrow}
                            alt="decrease_arrow"
                            className="w-4 h-4"
                          />
                        </button>
                        <input
                          onChange={(e) =>
                            updateCartQuantity(itemId, Number(e.target.value))
                          }
                          type="number"
                          value={item.quantity}
                          className="w-8 border text-center appearance-none"
                        />
                        <button onClick={() => addToCart(itemId)}>
                          <Image
                            src={assets.increase_arrow}
                            alt="increase_arrow"
                            className="w-4 h-4"
                          />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 md:px-4 px-1 text-gray-600">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => router.push("/all-products")}
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
          <OrderSummary shippingFee={shippingFee} />
          <Link href="/checkout">
            <button className="mt-4 w-full px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
              Thanh Toán
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Cart;
