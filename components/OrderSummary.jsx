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
//     variants, // Thêm variants nếu có trong AppContext
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
//         const discountValue = (getCartAmount() * data.discountPercentage) / 100;
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

//   const calculateWeight = (productId, quantity) => {
//     const specs = specifications[productId.split("_")[0]] || []; // Lấy productId từ key
//     let weight = 100; // Default weight
//     const weightSpec = specs.find((s) => s.key.toLowerCase() === "trọng lượng");
//     if (weightSpec) {
//       const weightValue = parseFloat(weightSpec.value.replace(/[^0-9.]/g, ""));
//       if (!isNaN(weightValue)) weight = weightValue;
//     }
//     const variant = variants[productId.split("_")[0]]?.find(
//       (v) => v._id.toString() === productId.split("_")[1]
//     );
//     return (variant?.weight || weight) * quantity;
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

//       const cartItemsArray = Object.entries(cartItems)
//         .map(([key, item]) => {
//           const [productId, variantId] = key.split("_");
//           return {
//             product: productId,
//             variantId,
//             quantity: item.quantity || 1,
//           };
//         })
//         .filter((item) => item.quantity > 0);

//       if (cartItemsArray.length === 0) {
//         toast.error("Cart is empty");
//         setIsSubmitting(false);
//         return;
//       }

//       const token = await getToken();
//       const totalWeight = Object.entries(cartItems).reduce(
//         (sum, [key, item]) => {
//           return sum + calculateWeight(key, item.quantity);
//         },
//         0
//       );

//       const pickMoney = calculateFinalTotal();
//       console.log("Pick Money (CoD):", pickMoney);

//       const payload = {
//         action: "createOrder",
//         payload: {
//           products: cartItemsArray.map((item) => {
//             const specs = specifications[item.product] || [];
//             let weight = 100;
//             const weightSpec = specs.find(
//               (s) => s.key.toLowerCase() === "trọng lượng"
//             );
//             if (weightSpec) {
//               const weightValue = parseFloat(
//                 weightSpec.value.replace(/[^0-9.]/g, "")
//               );
//               if (!isNaN(weightValue)) weight = weightValue;
//             }
//             const variant = variants[item.product]?.find(
//               (v) => v._id.toString() === item.variantId
//             );
//             return {
//               name:
//                 cartItems[`${item.product}_${item.variantId}`]?.name ||
//                 "Product",
//               weight: variant?.weight || weight,
//               quantity: item.quantity,
//               product_code: item.product,
//             };
//           }),
//           order: {
//             id: `ORDER-${Date.now()}`,
//             pick_name: "QuickCart Store",
//             pick_address: "590 CMT8 P.11",
//             pick_province: "TP. Hồ Chí Minh",
//             pick_district: "Quận 3",
//             pick_ward: "Phường 11",
//             pick_tel: "0911222333",
//             tel: selectedAddress.phoneNumber,
//             name: selectedAddress.fullName,
//             address: selectedAddress.area,
//             province: selectedAddress.city,
//             district: selectedAddress.state,
//             ward: selectedAddress.ward || "Khác",
//             hamlet: "Khác",
//             is_freeship: "0",
//             pick_money: pickMoney,
//             note: "Giao hàng cẩn thận",
//             value: getCartAmount(),
//             transport: "road",
//             pick_option: "cod",
//             deliver_option: "none",
//           },
//         },
//       };
//       console.log("Payload sent to GHTK:", JSON.stringify(payload, null, 2));

//       const ghtkOrderResponse = await axios.post("/api/ghtk", payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!ghtkOrderResponse.data.success) {
//         console.error("GHTK Response:", ghtkOrderResponse.data);
//         throw new Error(
//           ghtkOrderResponse.data.message || "GHTK failed to create order"
//         );
//       }

//       const trackingCode = ghtkOrderResponse.data.data.order?.label;

//       const { data } = await axios.post(
//         "/api/order/create",
//         {
//           address: selectedAddress._id,
//           items: cartItemsArray, // Sử dụng cấu trúc mới
//           promoCode: promoCode || null,
//           trackingCode,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (data.success) {
//         toast.success(data.message);
//         setCartItems({});
//         setDiscount(0);
//         router.push("/order-placed");
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error(
//         "Create Order Error:",
//         error.response?.data || error.message
//       );
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

//   useEffect(() => {
//     console.log("Cart Items Changed:", JSON.stringify(cartItems, null, 2));
//     if (selectedAddress) {
//       console.log(
//         "Selected Address Exists, skipping shipping fee calculation..."
//       );
//     } else {
//       console.log("No selected address, skipping shipping fee calculation");
//     }
//   }, [cartItems, selectedAddress, specifications]);

//   const calculateFinalTotal = () => {
//     const subtotal = getCartAmount();
//     const tax = Math.floor(subtotal * 0.02);
//     return subtotal + tax + (shippingFee || 0) - discount;
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
//                   ? `${selectedAddress.fullName}, ${selectedAddress.phoneNumber}, ${selectedAddress.area}, ${selectedAddress.ward}, ${selectedAddress.state}, ${selectedAddress.city}, ${selectedAddress.pincode}`
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
//                     {address.fullName}, {address.phoneNumber}, {address.area},{" "}
//                     {address.ward}, {address.state}, {address.city},{" "}
//                     {address.pincode}
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
//             <p className="font-medium text-gray-800">
//               {shippingFee !== null
//                 ? formatCurrency(shippingFee)
//                 : "Đang tính..."}
//             </p>
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

// export default OrderSummary;
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";

const OrderSummary = ({ shippingFee }) => {
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

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [bankCode, setBankCode] = useState("");

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
        }
      } else {
        toast.error(data.message || "Không thể tải địa chỉ");
      }
    } catch (error) {
      toast.error("Lỗi khi tải địa chỉ: " + error.message);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const applyPromoCode = async () => {
    try {
      if (!promoCode) {
        toast.error("Vui lòng nhập mã giảm giá");
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
        toast.success("Áp dụng mã giảm giá thành công!");
      } else {
        setDiscount(0);
        toast.error(data.message || "Mã giảm giá không hợp lệ");
      }
    } catch (error) {
      setDiscount(0);
      toast.error("Lỗi khi áp dụng mã: " + error.message);
    }
  };

  const calculateWeight = (productId, quantity) => {
    const specs = specifications[productId.split("_")[0]] || [];
    let weight = 100;
    const weightSpec = specs.find((s) => s.key.toLowerCase() === "trọng lượng");
    if (weightSpec) {
      const weightValue = parseFloat(weightSpec.value.replace(/[^0-9.]/g, ""));
      if (!isNaN(weightValue)) weight = weightValue;
    }
    const variant = variants[productId.split("_")[0]]?.find(
      (v) => v._id.toString() === productId.split("_")[1]
    );
    return (variant?.weight || weight) * quantity;
  };

  const createOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (!selectedAddress) {
        toast.error("Vui lòng chọn địa chỉ giao hàng");
        return;
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
        return;
      }

      const token = await getToken();
      const pickMoney = calculateFinalTotal();
      console.log("Pick Money:", pickMoney);

      if (paymentMethod === "vnpay") {
        if (!bankCode) {
          toast.error("Vui lòng chọn ngân hàng!");
          return;
        }
        const { data: vnpayUrl } = await axios.post(
          "/api/vnpay/create-payment",
          {
            amount: pickMoney,
            orderId: `ORDER-${Date.now()}`,
            orderInfo: `Thanh toán đơn hàng từ QuickCart`,
            bankCode,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Received VNPAY URL:", vnpayUrl);
        if (vnpayUrl && typeof vnpayUrl === "string") {
          window.location.href = vnpayUrl;
        } else {
          toast.error("URL thanh toán không hợp lệ: " + vnpayUrl);
        }
        return;
      } else {
        const payload = {
          action: "createOrder",
          payload: {
            products: cartItemsArray.map((item) => {
              const specs = specifications[item.product] || [];
              let weight = 100;
              const weightSpec = specs.find(
                (s) => s.key.toLowerCase() === "trọng lượng"
              );
              if (weightSpec) {
                const weightValue = parseFloat(
                  weightSpec.value.replace(/[^0-9.]/g, "")
                );
                if (!isNaN(weightValue)) weight = weightValue;
              }
              const variant = variants[item.product]?.find(
                (v) => v._id.toString() === item.variantId
              );
              return {
                name:
                  cartItems[`${item.product}_${item.variantId}`]?.name ||
                  "Sản phẩm",
                weight: variant?.weight || weight,
                quantity: item.quantity,
                product_code: item.product,
              };
            }),
            order: {
              id: `ORDER-${Date.now()}`,
              pick_name: "QuickCart Store",
              pick_address: "590 CMT8, P.11, Q.3, TP. HCM",
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
              pick_money: pickMoney,
              note: "Giao hàng cẩn thận",
              value: getCartAmount(),
              transport: "road",
              pick_option: "cod",
              deliver_option: "none",
            },
          },
        };
        console.log("Payload GHTK:", JSON.stringify(payload, null, 2));

        const ghtkResponse = await axios.post("/api/ghtk", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!ghtkResponse.data.success) {
          throw new Error(ghtkResponse.data.message || "Tạo đơn GHTK thất bại");
        }

        const trackingCode = ghtkResponse.data.data.order?.label;

        const orderResponse = await axios.post(
          "/api/order/create",
          {
            address: selectedAddress._id,
            items: cartItemsArray,
            promoCode: promoCode || null,
            trackingCode,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (orderResponse.data.success) {
          toast.success(orderResponse.data.message || "Đặt hàng thành công");
          setCartItems({});
          setDiscount(0);
          router.push("/order-placed");
        } else {
          throw new Error(orderResponse.data.message || "Tạo đơn thất bại");
        }
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error.response?.data || error.message);
      toast.error(error.message || "Đã xảy ra lỗi khi đặt hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) fetchUserAddresses();
  }, [user]);

  useEffect(() => {
    console.log("Cart Items:", JSON.stringify(cartItems, null, 2));
    console.log("Selected Address:", selectedAddress);
  }, [cartItems, selectedAddress, specifications]);

  const calculateFinalTotal = () => {
    const subtotal = getCartAmount() || 0;
    const tax = Math.floor(subtotal * 0.02);
    const finalShippingFee = shippingFee !== null ? shippingFee : 0;
    return subtotal + tax + finalShippingFee - discount;
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
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {`${address.fullName}, ${address.phoneNumber}, ${address.area}, ${address.ward}, ${address.state}, ${address.city}`}
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
            PHƯƠNG THỨC THANH TOÁN
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="text-gray-600">
                Thanh toán khi nhận hàng (COD)
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="vnpay"
                checked={paymentMethod === "vnpay"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="text-gray-600">Thanh toán qua VNPAY</span>
            </label>
          </div>
        </div>

        {paymentMethod === "vnpay" && (
          <div>
            <label className="text-base font-medium uppercase text-gray-600 block mb-2">
              CHỌN NGÂN HÀNG
            </label>
            <select
              className="w-full p-2 border text-gray-600"
              onChange={(e) => setBankCode(e.target.value)}
              value={bankCode}
            >
              <option value="">Chọn ngân hàng</option>
              <option value="NCB">Ngân hàng NCB</option>
              <option value="VCB">Ngân hàng VCB</option>
              <option value="TCB">Ngân hàng Techcombank</option>
            </select>
          </div>
        )}

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
            <p className="uppercase text-gray-600">
              Mặt hàng ({getCartCount()})
            </p>
            <p className="text-gray-800">
              {formatCurrency(getCartAmount() || 0)}
            </p>
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
              {formatCurrency(Math.floor((getCartAmount() || 0) * 0.02))}
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
    </div>
  );
};

export default OrderSummary;
