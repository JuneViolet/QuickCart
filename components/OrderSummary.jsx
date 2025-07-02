// //bản an toàn
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { useAppContext } from "@/context/AppContext";

// const OrderSummary = ({ shippingFee }) => {
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
//     specifications,
//     variants,
//   } = useAppContext();

//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [userAddresses, setUserAddresses] = useState([]);
//   const [promoCode, setPromoCode] = useState("");
//   const [discount, setDiscount] = useState(0);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState("cod");
//   const [bankCode, setBankCode] = useState("");

//   useEffect(() => {
//     if (user) fetchUserAddresses();
//   }, [user]);

//   const fetchUserAddresses = async () => {
//     try {
//       const token = await getToken();
//       const { data } = await axios.get("/api/user/get-address", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) {
//         setUserAddresses(data.addresses);
//         if (data.addresses.length > 0) {
//           setSelectedAddress(
//             data.addresses.find((a) => a.isDefault) || data.addresses[0]
//           );
//         }
//       } else {
//         toast.error(data.message || "Không thể tải địa chỉ");
//       }
//     } catch (error) {
//       toast.error("Lỗi khi tải địa chỉ: " + error.message);
//     }
//   };

//   const applyPromoCode = async () => {
//     try {
//       if (!promoCode.trim()) {
//         toast.error("Vui lòng nhập mã giảm giá");
//         return;
//       }
//       const token = await getToken();
//       const { data } = await axios.post(
//         "/api/promo/validate",
//         { code: promoCode.trim() },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (data.success) {
//         const discountValue = (getCartAmount() * data.discountPercentage) / 100;
//         setDiscount(Math.floor(discountValue));
//         toast.success("Áp dụng mã giảm giá thành công!");
//       } else {
//         setDiscount(0);
//         toast.error(data.message || "Mã giảm giá không hợp lệ");
//       }
//     } catch (error) {
//       setDiscount(0);
//       toast.error("Lỗi khi áp dụng mã: " + error.message);
//     }
//   };

//   const calculateFinalTotal = () => {
//     const subtotal = getCartAmount() || 0;
//     const tax = Math.floor(subtotal * 0.02);
//     const finalShippingFee = shippingFee !== null ? shippingFee : 0;
//     const total = subtotal + tax + finalShippingFee - discount;
//     return Math.max(0, total);
//   };

//   const validateOrderData = () => {
//     if (!selectedAddress) {
//       toast.error("Vui lòng chọn địa chỉ giao hàng");
//       return false;
//     }

//     const cartItemsArray = Object.entries(cartItems)
//       .map(([key, item]) => ({
//         product: key.split("_")[0],
//         variantId: key.split("_")[1],
//         quantity: item.quantity || 1,
//       }))
//       .filter((item) => item.quantity > 0);

//     if (cartItemsArray.length === 0) {
//       toast.error("Giỏ hàng trống");
//       return false;
//     }

//     return cartItemsArray;
//   };

//   const createOrder = async () => {
//     if (isSubmitting) return;
//     setIsSubmitting(true);

//     try {
//       const cartItemsArray = validateOrderData();
//       if (!cartItemsArray) return;

//       const token = await getToken();
//       const trackingCode = `ORDER-${Date.now()}`;
//       const total = calculateFinalTotal();

//       const response = await axios.post(
//         "/api/order/create",
//         {
//           address: selectedAddress._id,
//           items: cartItemsArray,
//           promoCode: promoCode || null,
//           trackingCode,
//           paymentMethod,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const data = response.data;

//       if (!data.success) {
//         throw new Error(data.message || "Tạo đơn hàng thất bại");
//       }

//       if (paymentMethod === "vnpay" && data.order?.vnpayUrl) {
//         window.location.href = data.order.vnpayUrl;
//       } else {
//         toast.success(data.message || "Đặt hàng thành công");
//         setCartItems({});
//         setPromoCode("");
//         setDiscount(0);
//         router.push("/order-placed");
//       }
//     } catch (error) {
//       console.error("Đặt hàng lỗi:", error);
//       toast.error(error.message || "Lỗi khi đặt hàng");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="w-full md:w-96 bg-gray-500/5 p-5">
//       <h2 className="text-xl md:text-2xl font-medium text-gray-700">
//         Chi Tiết Mua Hàng
//       </h2>
//       <hr className="border-gray-500/30 my-5" />
//       <div className="space-y-6">
//         {/* Địa chỉ */}
//         <div>
//           <label className="text-base font-medium uppercase text-gray-600 block mb-2">
//             CHỌN ĐỊA CHỈ
//           </label>
//           <div className="relative inline-block w-full text-sm border">
//             <button
//               className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700"
//               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             >
//               <span>
//                 {selectedAddress
//                   ? `${selectedAddress.fullName}, ${selectedAddress.phoneNumber}, ${selectedAddress.area}, ${selectedAddress.ward}, ${selectedAddress.state}, ${selectedAddress.city}`
//                   : "Chọn địa chỉ"}
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
//               <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5 max-h-60 overflow-y-auto">
//                 {userAddresses.map((address, index) => (
//                   <li
//                     key={address._id || index}
//                     className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
//                     onClick={() => {
//                       setSelectedAddress(address);
//                       setIsDropdownOpen(false);
//                     }}
//                   >
//                     {`${address.fullName}, ${address.phoneNumber}, ${address.area}, ${address.ward}, ${address.state}, ${address.city}`}
//                   </li>
//                 ))}
//                 <li
//                   onClick={() => router.push("/add-address")}
//                   className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center text-orange-600 font-medium"
//                 >
//                   + Thêm địa chỉ mới
//                 </li>
//               </ul>
//             )}
//           </div>
//         </div>

//         {/* Phương thức thanh toán */}
//         <div>
//           <label className="text-base font-medium uppercase text-gray-600 block mb-2">
//             PHƯƠNG THỨC THANH TOÁN
//           </label>
//           <div className="flex flex-col gap-2">
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="radio"
//                 value="cod"
//                 checked={paymentMethod === "cod"}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//                 className="text-orange-600 focus:ring-orange-500"
//               />
//               <span className="text-gray-600">Thanh toán khi nhận hàng</span>
//             </label>
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="radio"
//                 value="vnpay"
//                 checked={paymentMethod === "vnpay"}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//                 className="text-orange-600 focus:ring-orange-500"
//               />
//               <span className="text-gray-600">Thanh toán qua VNPAY</span>
//             </label>
//           </div>
//         </div>

//         {/* Mã giảm giá */}
//         <div>
//           <label className="text-base font-medium uppercase text-gray-600 block mb-2">
//             MÃ GIẢM GIÁ
//           </label>
//           <div className="flex flex-col gap-3">
//             <input
//               type="text"
//               className="w-full p-2.5 border text-gray-600"
//               placeholder="Nhập mã giảm giá"
//               value={promoCode}
//               onChange={(e) => {
//                 setPromoCode(e.target.value);
//                 setDiscount(0);
//               }}
//             />
//             <button
//               onClick={applyPromoCode}
//               className={`px-9 py-2 text-white transition-colors ${
//                 !promoCode.trim()
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-orange-600 hover:bg-orange-700"
//               }`}
//             >
//               Áp Dụng
//             </button>
//           </div>
//         </div>

//         <hr className="border-gray-500/30 my-5" />

//         {/* Tổng */}
//         <div className="space-y-4">
//           <div className="flex justify-between font-medium">
//             <p className="text-gray-600 uppercase">
//               Mặt hàng ({getCartCount()})
//             </p>
//             <p>{formatCurrency(getCartAmount() || 0)}</p>
//           </div>
//           <div className="flex justify-between">
//             <p className="text-gray-600">Phí vận chuyển</p>
//             <p>{formatCurrency(shippingFee || 0)}</p>
//           </div>
//           <div className="flex justify-between">
//             <p className="text-gray-600">Thuế (2%)</p>
//             <p>{formatCurrency(Math.floor((getCartAmount() || 0) * 0.02))}</p>
//           </div>
//           {discount > 0 && (
//             <div className="flex justify-between">
//               <p className="text-gray-600">Giảm giá</p>
//               <p className="text-green-600">-{formatCurrency(discount)}</p>
//             </div>
//           )}
//           <div className="flex justify-between font-medium border-t pt-3 text-lg">
//             <p>Tổng</p>
//             <p>{formatCurrency(calculateFinalTotal())}</p>
//           </div>
//         </div>

//         <button
//           onClick={createOrder}
//           disabled={isSubmitting || !selectedAddress || getCartCount() === 0}
//           className={`w-full py-3 mt-5 text-white transition-colors ${
//             isSubmitting || !selectedAddress || getCartCount() === 0
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-orange-600 hover:bg-orange-700"
//           }`}
//         >
//           {isSubmitting ? "Đang xử lý..." : "ĐẶT HÀNG"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OrderSummary;
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import { useUser } from "@clerk/nextjs";

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
    variants,
  } = useAppContext();

  const { isLoaded } = useUser();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [bankCode, setBankCode] = useState("");
  const [shippingFee, setShippingFee] = useState(null);

  useEffect(() => {
    if (!isLoaded) {
      console.log("Đang đợi Clerk tải dữ liệu người dùng...");
      return;
    }
    if (user) {
      fetchUserAddresses();
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (selectedAddress && cartItems && Object.keys(cartItems).length > 0) {
      calculateShippingFee();
    } else {
      setShippingFee(0);
    }
  }, [selectedAddress, cartItems]);

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-address", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(
            data.addresses.find((a) => a.isDefault) || data.addresses[0]
          );
        } else {
          toast.info("Bạn chưa có địa chỉ. Vui lòng thêm địa chỉ mới.");
        }
      } else {
        toast.error(data.message || "Không thể tải địa chỉ");
      }
    } catch (error) {
      console.error("Lỗi khi tải địa chỉ:", error);
      toast.error("Lỗi khi tải địa chỉ: " + error.message);
    }
  };

  const applyPromoCode = async () => {
    try {
      if (!promoCode.trim()) {
        toast.error("Vui lòng nhập mã giảm giá");
        return;
      }
      const token = await getToken();
      const { data } = await axios.post(
        "/api/promo/validate",
        { code: promoCode.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        const discountValue = (getCartAmount() * data.discountPercentage) / 100;
        setDiscount(Math.floor(discountValue));
        toast.success("Áp dụng mã giảm giá thành công!");
      } else {
        setDiscount(0);
        toast.error(data.message || "Mã giảm giá không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi áp dụng mã:", error);
      setDiscount(0);
      toast.error("Lỗi khi áp dụng mã: " + error.message);
    }
  };

  const calculateShippingFee = async () => {
    if (
      !selectedAddress ||
      !selectedAddress.districtId ||
      !selectedAddress.wardCode ||
      !cartItems ||
      Object.keys(cartItems).length === 0
    ) {
      console.log("Skipping shipping fee calculation: Invalid data");
      setShippingFee(0);
      return;
    }

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

      const totalValue = getCartAmount() || 0;

      const payload = {
        districtId: selectedAddress.districtId,
        wardCode: selectedAddress.wardCode,
        address: selectedAddress.area || "123 Nguyễn Chí Thanh",
        weight: Math.max(totalWeight, 50),
        value: totalValue,
      };

      const token = await getToken();
      const { data } = await axios.post("/api/shipping/fee", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setShippingFee(data.data.fee || 0);
        console.log("Shipping Fee Calculated:", data.data.fee);
      } else {
        throw new Error(data.message || "Failed to calculate shipping fee");
      }
    } catch (error) {
      console.error("Calculate Shipping Fee Error:", error.message);
      setShippingFee(0);
      toast.error("Không thể tính phí vận chuyển: " + error.message);
    }
  };

  const calculateFinalTotal = () => {
    const subtotal = getCartAmount() || 0;
    const tax = Math.floor(subtotal * 0.02);
    const finalShippingFee = shippingFee !== null ? shippingFee : 0;
    const total = subtotal + tax + finalShippingFee - discount;
    return Math.max(0, total);
  };

  const validateOrderData = () => {
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return false;
    }

    const cartItemsArray = Object.entries(cartItems)
      .map(([key, item]) => ({
        product: key.split("_")[0],
        variantId: key.split("_")[1],
        quantity: item.quantity || 1,
      }))
      .filter((item) => item.quantity > 0);

    if (cartItemsArray.length === 0) {
      toast.error("Giỏ hàng trống");
      return false;
    }

    return cartItemsArray;
  };

  const createOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const cartItemsArray = validateOrderData();
      if (!cartItemsArray) return;

      const token = await getToken();
      const internalTrackingCode = `ORDER-${Date.now()}`;
      const subtotal = getCartAmount() || 0;
      const tax = Math.floor(subtotal * 0.02);
      const shippingFeeValue = await calculateShippingFee();
      const total = subtotal + tax + shippingFeeValue - discount;

      const response = await axios.post(
        "/api/order/create",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
          promoCode: promoCode || null,
          trackingCode: internalTrackingCode,
          paymentMethod,
          amount: total,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Tạo đơn hàng thất bại");
      }

      const ghnTrackingCode = data.order?.trackingCode;
      if (ghnTrackingCode) {
        console.log("Mã theo dõi GHN:", ghnTrackingCode);
      } else {
        console.warn(
          "Không tìm thấy mã GHN, sử dụng mã nội bộ:",
          internalTrackingCode
        );
      }

      if (paymentMethod === "vnpay" && data.order?.vnpayUrl) {
        window.location.href = data.order.vnpayUrl;
      } else {
        toast.success(data.message || "Đặt hàng thành công");
        setCartItems({});
        setPromoCode("");
        setDiscount(0);
        router.push(
          `/order-placed?trackingCode=${
            ghnTrackingCode || internalTrackingCode
          }`
        );
      }
    } catch (error) {
      console.error("Đặt hàng lỗi:", error);
      toast.error(
        error.response?.data?.message || error.message || "Lỗi khi đặt hàng"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Chi Tiết Mua Hàng
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        {/* Địa chỉ */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            CHỌN ĐỊA CHỈ
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.phoneNumber}, ${selectedAddress.area}, ${selectedAddress.ward}, ${selectedAddress.state}, ${selectedAddress.city}`
                  : "Chọn địa chỉ"}
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
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5 max-h-60 overflow-y-auto">
                {userAddresses.map((address, index) => (
                  <li
                    key={address._id || index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => {
                      setSelectedAddress(address);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {`${address.fullName}, ${address.phoneNumber}, ${address.area}, ${address.ward}, ${address.state}, ${address.city}`}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center text-orange-600 font-medium"
                >
                  + Thêm địa chỉ mới
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            PHƯƠNG THỨC THANH TOÁN
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span className="text-gray-600">Thanh toán khi nhận hàng</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="vnpay"
                checked={paymentMethod === "vnpay"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span className="text-gray-600">Thanh toán qua VNPAY</span>
            </label>
          </div>
        </div>

        {/* Mã giảm giá */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            MÃ GIẢM GIÁ
          </label>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              className="w-full p-2.5 border text-gray-600"
              placeholder="Nhập mã giảm giá"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setDiscount(0);
              }}
            />
            <button
              onClick={applyPromoCode}
              className={`px-9 py-2 text-white transition-colors ${
                !promoCode.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              Áp Dụng
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        {/* Tổng */}
        <div className="space-y-4">
          <div className="flex justify-between font-medium">
            <p className="text-gray-600 uppercase">
              Mặt hàng ({getCartCount()})
            </p>
            <p>{formatCurrency(getCartAmount() || 0)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Phí vận chuyển</p>
            <p>{formatCurrency(shippingFee || 0)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Thuế (2%)</p>
            <p>{formatCurrency(Math.floor((getCartAmount() || 0) * 0.02))}</p>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <p className="text-gray-600">Giảm giá</p>
              <p className="text-green-600">-{formatCurrency(discount)}</p>
            </div>
          )}
          <div className="flex justify-between font-medium border-t pt-3 text-lg">
            <p>Tổng</p>
            <p>{formatCurrency(calculateFinalTotal())}</p>
          </div>
        </div>

        <button
          onClick={createOrder}
          disabled={isSubmitting || !selectedAddress || getCartCount() === 0}
          className={`w-full py-3 mt-5 text-white transition-colors ${
            isSubmitting || !selectedAddress || getCartCount() === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {isSubmitting ? "Đang xử lý..." : "ĐẶT HÀNG"}
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
