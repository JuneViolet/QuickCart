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
//   } = useAppContext();

//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [userAddresses, setUserAddresses] = useState([]);
//   const [promoCode, setPromoCode] = useState(""); // State cho mã giảm giá
//   const [discount, setDiscount] = useState(0); // State cho giá trị giảm giá

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

//   // Hàm xử lý áp dụng mã giảm giá
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
//         // Tính số tiền giảm dựa trên discountPercentage
//         const discountValue =
//           data.discountPercentage < 1
//             ? getCartAmount() * data.discountPercentage // Nếu là phần trăm
//             : data.discountPercentage; // Nếu là số tiền cố định
//         setDiscount(Math.floor(discountValue)); // Làm tròn số
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
//     try {
//       if (!selectedAddress) {
//         return toast.error("please select an address");
//       }

//       let cartItemsArray = Object.keys(cartItems).map((key) => ({
//         product: key,
//         quantity: cartItems[key],
//       }));
//       cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

//       if (cartItemsArray.length === 0) {
//         return toast.error("Cart is empty");
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
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       fetchUserAddresses();
//     }
//   }, [user]);

//   // Tính tổng tiền cuối cùng
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
//             <p className="text-gray-800">
//               {getCartAmount()}
//               {currency}
//             </p>
//           </div>
//           <div className="flex justify-between">
//             <p className="text-gray-600">Phí vận chuyển</p>
//             <p className="font-medium text-gray-800">Free</p>
//           </div>
//           <div className="flex justify-between">
//             <p className="text-gray-600">Thuế (2%)</p>
//             <p className="font-medium text-gray-800">
//               {currency}
//               {Math.floor(getCartAmount() * 0.02)}
//             </p>
//           </div>
//           {discount > 0 && (
//             <div className="flex justify-between">
//               <p className="text-gray-600">Giảm Giá</p>
//               <p className="font-medium text-green-600">
//                 -{currency}
//                 {discount}
//               </p>
//             </div>
//           )}
//           <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
//             <p>Tổng</p>
//             <p>
//               {calculateFinalTotal()}
//               {currency}
//             </p>
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={createOrder}
//         className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700"
//       >
//         ĐẶT HÀNG
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
    formatCurrency, // Thêm formatCurrency từ context
  } = useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

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
        const discountValue =
          data.discountPercentage < 1
            ? getCartAmount() * data.discountPercentage
            : data.discountPercentage;
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
    try {
      if (!selectedAddress) {
        return toast.error("please select an address");
      }

      let cartItemsArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key],
      }));
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        return toast.error("Cart is empty");
      }

      const token = await getToken();

      const { data } = await axios.post(
        "/api/order/create",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
          promoCode: promoCode || null,
          discount: discount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setCartItems({});
        router.push("/order-placed");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
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
        className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700"
      >
        ĐẶT HÀNG
      </button>
    </div>
  );
};

export default OrderSummary;
