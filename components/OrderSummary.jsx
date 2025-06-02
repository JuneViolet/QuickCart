// import { useAppContext } from "@/context/AppContext";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import toast from "react-hot-toast";

// const OrderSummary = () => {
//   const {
//     currency,
//     router,
//     getCartCount,
//     getCartAmount,
//     getToken,
//     user,
//     cartItems,
//     setCartItems,
//     formatCurrency,
//   } = useAppContext();

//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [userAddresses, setUserAddresses] = useState([]);
//   const [promoCode, setPromoCode] = useState("");
//   const [discount, setDiscount] = useState(0);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const fetchUserAddresses = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get("/api/user/get-address", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) {
//         setUserAddresses(data.addresses);
//         if (data.addresses.length > 0) {
//           setSelectedAddress(data.addresses[0]);
//         }
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleAddressSelect = (address) => {
//     setSelectedAddress(address);
//     setIsDropdownOpen(false);
//   };

//   const applyPromoCode = async () => {
//     try {
//       if (!promoCode) {
//         toast.error("Please enter a promo code");
//         return;
//       }

//       const token = await getToken();
//       const { data } = await axios.post(
//         "/api/promo/validate",
//         { code: promoCode },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (data.success) {
//         const discountValue = (getCartAmount() * data.discountPercentage) / 100; // Tính giảm giá theo phần trăm
//         console.log("Promo applied:", {
//           discountPercentage: data.discountPercentage,
//           subtotal: getCartAmount(),
//           discountValue,
//         });
//         setDiscount(Math.floor(discountValue));
//         toast.success("Promo code applied successfully!");
//       } else {
//         setDiscount(0);
//         toast.error(data.message);
//       }
//     } catch (error) {
//       setDiscount(0);
//       toast.error("Invalid promo code");
//     }
//   };

//   const createOrder = async () => {
//     if (isSubmitting) return;
//     setIsSubmitting(true);
//     try {
//       if (!selectedAddress) {
//         toast.error("Please select an address");
//         setIsSubmitting(false);
//         return;
//       }

//       let cartItemsArray = Object.keys(cartItems).map((key) => ({
//         product: key,
//         quantity: cartItems[key],
//       }));
//       cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

//       if (cartItemsArray.length === 0) {
//         toast.error("Cart is empty");
//         setIsSubmitting(false);
//         return;
//       }

//       const token = await getToken();

//       console.log("Order data sent:", {
//         address: selectedAddress._id,
//         items: cartItemsArray,
//         promoCode,
//       });

//       const { data } = await axios.post(
//         "/api/order/create",
//         {
//           address: selectedAddress._id,
//           items: cartItemsArray,
//           promoCode: promoCode || null, // Không gửi discount
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       console.log("Order response:", data);

//       if (data.success) {
//         toast.success(data.message);
//         setCartItems({});
//         setDiscount(0); // Reset discount sau khi đặt hàng
//         router.push("/order-placed");
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       fetchUserAddresses();
//     }
//   }, [user]);

//   const calculateFinalTotal = () => {
//     const subtotal = getCartAmount();
//     const tax = Math.floor(subtotal * 0.02);
//     return subtotal + tax - discount;
//   };

//   return (
//     <div className="w-full md:w-96 bg-gray-500/5 p-5">
//       <h2 className="text-xl md:text-2xl font-medium text-gray-700">
//         Chi Tiết Mua Hàng
//       </h2>
//       <hr className="border-gray-500/30 my-5" />
//       <div className="space-y-6">
//         <div>
//           <label className="text-base font-medium uppercase text-gray-600 block mb-2">
//             CHỌN ĐỊA CHỈ
//           </label>
//           <div className="relative inline-block w-full text-sm border">
//             <button
//               className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
//               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             >
//               <span>
//                 {selectedAddress
//                   ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
//                   : "Select Address"}
//               </span>
//               <svg
//                 className={`w-5 h-5 inline float-right transition-transform duration-200 ${
//                   isDropdownOpen ? "rotate-0" : "-rotate-90"
//                 }`}
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="#6B7280"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M19 9l-7 7-7-7"
//                 />
//               </svg>
//             </button>

//             {isDropdownOpen && (
//               <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
//                 {userAddresses.map((address, index) => (
//                   <li
//                     key={index}
//                     className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
//                     onClick={() => handleAddressSelect(address)}
//                   >
//                     {address.fullName}, {address.area}, {address.city},{" "}
//                     {address.state}
//                   </li>
//                 ))}
//                 <li
//                   onClick={() => router.push("/add-address")}
//                   className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
//                 >
//                   + Thêm địa chỉ mới
//                 </li>
//               </ul>
//             )}
//           </div>
//         </div>

//         <div>
//           <label className="text-base font-medium uppercase text-gray-600 block mb-2">
//             MÃ GIẢM GIÁ
//           </label>
//           <div className="flex flex-col items-start gap-3">
//             <input
//               type="text"
//               placeholder="Nhập mã giảm giá"
//               className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
//               value={promoCode}
//               onChange={(e) => setPromoCode(e.target.value)}
//             />
//             <button
//               onClick={applyPromoCode}
//               className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700"
//             >
//               Áp Dụng
//             </button>
//           </div>
//         </div>

//         <hr className="border-gray-500/30 my-5" />

//         <div className="space-y-4">
//           <div className="flex justify-between text-base font-medium">
//             <p className="uppercase text-gray-600">Mặt hàng {getCartCount()}</p>
//             <p className="text-gray-800">{formatCurrency(getCartAmount())}</p>
//           </div>
//           <div className="flex justify-between">
//             <p className="text-gray-600">Phí vận chuyển</p>
//             <p className="font-medium text-gray-800">Free</p>
//           </div>
//           <div className="flex justify-between">
//             <p className="text-gray-600">Thuế (2%)</p>
//             <p className="font-medium text-gray-800">
//               {formatCurrency(Math.floor(getCartAmount() * 0.02))}
//             </p>
//           </div>
//           {discount > 0 && (
//             <div className="flex justify-between">
//               <p className="text-gray-600">Giảm Giá</p>
//               <p className="font-medium text-green-600">
//                 -{formatCurrency(discount)}
//               </p>
//             </div>
//           )}
//           <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
//             <p>Tổng</p>
//             <p>{formatCurrency(calculateFinalTotal())}</p>
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={createOrder}
//         disabled={isSubmitting}
//         className={`w-full py-3 mt-5 text-white ${
//           isSubmitting
//             ? "bg-orange-400 cursor-not-allowed"
//             : "bg-orange-600 hover:bg-orange-700"
//         }`}
//       >
//         {isSubmitting ? "Đang xử lý..." : "ĐẶT HÀNG"}
//       </button>
//     </div>
//   );
// };

// export default OrderSummary
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    getToken,
    user,
    cartItems,
    setCartItems,
    formatCurrency,
    specifications,
  } = useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-address", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
    calculateShippingFee(address);
  };

  const applyPromoCode = async () => {
    try {
      if (!promoCode) {
        toast.error("Please enter a promo code");
        return;
      }

      const token = await getToken();
      const { data } = await axios.post(
        "/api/promo/validate",
        { code: promoCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        const discountValue = (getCartAmount() * data.discountPercentage) / 100;
        setDiscount(Math.floor(discountValue));
        toast.success("Promo code applied successfully!");
      } else {
        setDiscount(0);
        toast.error(data.message);
      }
    } catch (error) {
      setDiscount(0);
      toast.error("Invalid promo code");
    }
  };

  const calculateShippingFee = async (address) => {
    if (!address || !cartItems || Object.keys(cartItems).length === 0) {
      console.log(
        "Skipping shipping fee calculation: No address or cart items"
      );
      setShippingFee(null);
      return;
    }

    try {
      const totalWeight = Object.keys(cartItems).reduce((sum, itemId) => {
        const item = cartItems[itemId];
        const specs = specifications[itemId] || [];
        let weight = 1000; // Mặc định 1000g nếu không có specs

        const weightSpec = specs.find(
          (s) => s.key.toLowerCase() === "trọng lượng"
        );
        if (weightSpec) {
          const weightValue = parseFloat(
            weightSpec.value.replace(/[^0-9.]/g, "")
          );
          if (!isNaN(weightValue)) {
            weight = Math.max(weightValue, 1000); // Đảm bảo tối thiểu 1000g
          }
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

      const payload = {
        pick_province: "TP. Hồ Chí Minh",
        pick_district: "Quận 3",
        pick_address: "123 Đường Lấy Hàng, Quận 3",
        province:
          address.city === "Hồ Chí Minh"
            ? "TP. Hồ Chí Minh"
            : address.city || "TP. Hồ Chí Minh",
        district: address.state.startsWith("Quận ")
          ? address.state
          : `Quận ${address.state}` || "Quận 1",
        ward: address.ward?.startsWith("Phường ")
          ? address.ward
          : `Phường ${address.ward || "1"}`,
        address: address.area || "123 Nguyễn Chí Thanh",
        weight: totalWeight,
        value: getCartAmount(),
        transport: "road",
        deliver_option: "none",
        products: Object.keys(cartItems).map((itemId) => {
          const item = cartItems[itemId];
          const specs = specifications[itemId] || [];
          let weight = 1000;
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
            name: item.name || "Product",
            weight: weight,
            quantity: item.quantity || 1,
          };
        }),
      };

      console.log("Payload sent to GHTK:", JSON.stringify(payload, null, 2));

      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.post(
        "/api/ghtk",
        { action: "calculateFee", payload },
        { headers }
      );

      if (data.success && data.data?.success && data.data.fee?.fee) {
        setShippingFee(data.data.fee.fee);
        console.log("Shipping Fee Calculated:", data.data.fee.fee);
      } else {
        const errorMessage =
          data.data?.message || data.message || "GHTK failed to calculate fee";
        console.log("GHTK Error Response:", JSON.stringify(data, null, 2));
        setShippingFee(0);
        toast.error(`Không thể tính phí vận chuyển: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Calculate Shipping Fee Error:", error.message);
      setShippingFee(0);
      toast.error("Không thể tính phí vận chuyển: " + error.message);
    }
  };

  const createOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (!selectedAddress) {
        toast.error("Please select an address");
        setIsSubmitting(false);
        return;
      }

      let cartItemsArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key].quantity || 1,
      }));
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        toast.error("Cart is empty");
        setIsSubmitting(false);
        return;
      }

      const token = await getToken();

      const totalWeight = Object.keys(cartItems).reduce((sum, itemId) => {
        const specs = specifications[itemId] || [];
        let weight = 1000;
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
        return sum + weight * (cartItems[itemId].quantity || 1);
      }, 0);

      const ghtkOrderResponse = await axios.post(
        "/api/ghtk",
        {
          action: "createOrder",
          payload: {
            products: cartItemsArray.map((item) => {
              const specs = specifications[item.product] || [];
              let weight = 1000;
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
                name: cartItems[item.product]?.name || "Product",
                weight: weight,
                quantity: item.quantity,
                product_code: item.product,
              };
            }),
            order: {
              id: `ORDER-${Date.now()}`,
              pick_name: "QuickCart Store",
              pick_address: "590 CMT8 P.11",
              pick_province: "TP. Hồ Chí Minh",
              pick_district: "Quận 3",
              pick_ward: "Phường 11",
              pick_tel: "0911222333",
              tel: selectedAddress.phoneNumber,
              name: selectedAddress.fullName,
              address: selectedAddress.area,
              province: selectedAddress.city,
              district: selectedAddress.state,
              ward: selectedAddress.ward || "Khác",
              hamlet: "Khác",
              is_freeship: "0",
              pick_money: calculateFinalTotal() + (shippingFee || 0),
              note: "Giao hàng cẩn thận",
              value: getCartAmount(),
              transport: "road",
              pick_option: "cod",
              deliver_option: "none",
            },
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const trackingCode = ghtkOrderResponse.data.data.order?.label;

      const { data } = await axios.post(
        "/api/order/create",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
          promoCode: promoCode || null,
          trackingCode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setCartItems({});
        setDiscount(0);
        router.push("/order-placed");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  useEffect(() => {
    console.log("Cart Items Changed:", JSON.stringify(cartItems, null, 2));
    if (selectedAddress) {
      console.log("Selected Address Exists, calculating shipping fee...");
      calculateShippingFee(selectedAddress);
    } else {
      console.log("No selected address, skipping shipping fee calculation");
    }
  }, [cartItems, selectedAddress, specifications]);

  const calculateFinalTotal = () => {
    const subtotal = getCartAmount();
    const tax = Math.floor(subtotal * 0.02);
    return subtotal + tax + (shippingFee || 0) - discount;
  };

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Chi Tiết Mua Hàng
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            CHỌN ĐỊA CHỈ
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.phoneNumber}, ${selectedAddress.area}, ${selectedAddress.ward}, ${selectedAddress.state}, ${selectedAddress.city}, ${selectedAddress.pincode}`
                  : "Select Address"}
              </span>
              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : "-rotate-90"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.phoneNumber}, {address.area},{" "}
                    {address.ward}, {address.state}, {address.city},{" "}
                    {address.pincode}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Thêm địa chỉ mới
                </li>
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            MÃ GIẢM GIÁ
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button
              onClick={applyPromoCode}
              className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700"
            >
              Áp Dụng
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Mặt hàng {getCartCount()}</p>
            <p className="text-gray-800">{formatCurrency(getCartAmount())}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Phí vận chuyển</p>
            <p className="font-medium text-gray-800">
              {shippingFee !== null
                ? formatCurrency(shippingFee)
                : "Đang tính..."}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Thuế (2%)</p>
            <p className="font-medium text-gray-800">
              {formatCurrency(Math.floor(getCartAmount() * 0.02))}
            </p>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <p className="text-gray-600">Giảm Giá</p>
              <p className="font-medium text-green-600">
                -{formatCurrency(discount)}
              </p>
            </div>
          )}
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Tổng</p>
            <p>{formatCurrency(calculateFinalTotal())}</p>
          </div>
        </div>
      </div>

      <button
        onClick={createOrder}
        disabled={isSubmitting}
        className={`w-full py-3 mt-5 text-white ${
          isSubmitting
            ? "bg-orange-400 cursor-not-allowed"
            : "bg-orange-600 hover:bg-orange-700"
        }`}
      >
        {isSubmitting ? "Đang xử lý..." : "ĐẶT HÀNG"}
      </button>
    </div>
  );
};

export default OrderSummary;
