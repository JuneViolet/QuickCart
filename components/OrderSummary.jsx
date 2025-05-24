// import { addressDummyData } from "@/assets/assets";
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
//   const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state isSubmitting

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
//         const discountValue =
//           data.discountPercentage < 1
//             ? getCartAmount() * data.discountPercentage
//             : data.discountPercentage;
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
//     if (isSubmitting) return; // Ngăn gửi nhiều yêu cầu
//     setIsSubmitting(true); // Vô hiệu hóa nút
//     try {
//       if (!selectedAddress) {
//         toast.error("Please select an address");
//         setIsSubmitting(false); // Bật lại nút nếu có lỗi
//         return;
//       }

//       let cartItemsArray = Object.keys(cartItems).map((key) => ({
//         product: key,
//         quantity: cartItems[key],
//       }));
//       cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

//       if (cartItemsArray.length === 0) {
//         toast.error("Cart is empty");
//         setIsSubmitting(false); // Bật lại nút nếu có lỗi
//         return;
//       }

//       const token = await getToken();

//       const { data } = await axios.post(
//         "/api/order/create",
//         {
//           address: selectedAddress._id,
//           items: cartItemsArray,
//           promoCode: promoCode || null,
//           discount: discount,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (data.success) {
//         toast.success(data.message);
//         setCartItems({});
//         router.push("/order-placed");
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setIsSubmitting(false); // Bật lại nút sau khi hoàn tất
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
//         disabled={isSubmitting} // Vô hiệu hóa nút khi đang gửi
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

// export default OrderSummary;
import { addressDummyData } from "@/assets/assets";
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
  } = useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
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
        const discountValue = (getCartAmount() * data.discountPercentage) / 100; // Tính giảm giá theo phần trăm
        console.log("Promo applied:", {
          discountPercentage: data.discountPercentage,
          subtotal: getCartAmount(),
          discountValue,
        });
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
        quantity: cartItems[key],
      }));
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        toast.error("Cart is empty");
        setIsSubmitting(false);
        return;
      }

      const token = await getToken();

      console.log("Order data sent:", {
        address: selectedAddress._id,
        items: cartItemsArray,
        promoCode,
      });

      const { data } = await axios.post(
        "/api/order/create",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
          promoCode: promoCode || null, // Không gửi discount
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Order response:", data);

      if (data.success) {
        toast.success(data.message);
        setCartItems({});
        setDiscount(0); // Reset discount sau khi đặt hàng
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

  const calculateFinalTotal = () => {
    const subtotal = getCartAmount();
    const tax = Math.floor(subtotal * 0.02);
    return subtotal + tax - discount;
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
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
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
                    {address.fullName}, {address.area}, {address.city},{" "}
                    {address.state}
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
            <p className="font-medium text-gray-800">Free</p>
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
