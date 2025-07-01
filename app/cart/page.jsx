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
import mongoose from "mongoose";

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
  const [variants, setVariants] = useState({});
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      console.log("User not signed in, skipping cart page");
      return;
    }

    const fetchData = async () => {
      try {
        const fetchDefaultAddress = async () => {
          try {
            const token = await getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const { data } = await axios.get("/api/address/default", {
              headers,
            });
            console.log("Default Address Response:", data);
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

        const fetchSpecificationsAndVariants = async () => {
          const maxRetries = 3;
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              const itemIds = Object.keys(cartItems);
              if (itemIds.length === 0) {
                setSpecifications({});
                setVariants({});
                return;
              }

              const productIds = itemIds.map((id) => id.split("_")[0]);
              const validProductIds = productIds.filter((id) =>
                mongoose.Types.ObjectId.isValid(id)
              );
              if (validProductIds.length === 0) {
                console.warn(
                  "No valid product IDs found in cartItems:",
                  itemIds
                );
                setSpecifications({});
                setVariants({});
                return;
              }

              const token = await getToken();
              const headers = token ? { Authorization: `Bearer ${token}` } : {};
              const specResponse = await axios.post(
                "/api/specifications/list",
                { productIds: validProductIds },
                { headers }
              );
              if (specResponse.data.success) {
                const specs = specResponse.data.specifications.reduce(
                  (acc, spec) => {
                    acc[spec.productId] = spec.specs;
                    return acc;
                  },
                  {}
                );
                setSpecifications(specs);
              }

              const variantPromises = validProductIds.map(async (id) => {
                const response = await axios.get(`/api/product/${id}`, {
                  headers,
                });
                if (response.data.success) {
                  const product = response.data.product;
                  const productVariants = product.variants || [];
                  console.log(
                    "Fetched variants for product",
                    id,
                    productVariants
                  );
                  return { [id]: productVariants };
                }
                return { [id]: [] };
              });
              const variantResults = await Promise.all(variantPromises);
              const variantsData = variantResults.reduce(
                (acc, curr) => ({ ...acc, ...curr }),
                {}
              );
              setVariants(variantsData);
              break;
            } catch (error) {
              console.error(
                `Fetch Specifications/Variants Error (Attempt ${attempt}/${maxRetries}):`,
                {
                  message: error.message,
                  response: error.response?.data,
                  status: error.response?.status,
                }
              );
              if (attempt === maxRetries) {
                toast.error(
                  "Không thể lấy thông số kỹ thuật hoặc biến thể sau nhiều lần thử!"
                );
              } else {
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * attempt)
                );
              }
            }
          }
        };

        await Promise.all([
          fetchDefaultAddress(),
          fetchSpecificationsAndVariants(),
        ]);
        setIsDataReady(true);
      } catch (error) {
        console.error("Fetch Data Error:", error.message);
        toast.error("Lỗi khi tải dữ liệu giỏ hàng!");
      }
    };

    fetchData();
  }, [isSignedIn, getToken, router, cartItems]);

  useEffect(() => {
    if (isDataReady && defaultAddress && Object.keys(cartItems).length > 0) {
      const calculateShippingFee = async () => {
        if (
          !defaultAddress ||
          !defaultAddress.city ||
          !defaultAddress.state ||
          !defaultAddress.area ||
          Object.keys(cartItems).length === 0
        ) {
          console.log(
            "Skipping shipping fee calculation: No valid address or cart items",
            { defaultAddress }
          );
          return;
        }

        const itemIds = Object.keys(cartItems).map((key) => key.split("_")[0]);
        if (
          itemIds.some(
            (id) => !specifications[id] || !specifications[id].length
          )
        ) {
          console.log(
            "Skipping shipping fee calculation: Specifications not fully fetched",
            { specifications }
          );
          return;
        }

        try {
          const totalWeight = Object.values(cartItems).reduce((sum, item) => {
            const productId = item.productId;
            const variant = variants[productId]?.find(
              (v) => v._id.toString() === item.variantId
            );
            const specs = specifications[productId] || [];
            let weight = 50; // Mặc định 50g
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
            console.log(
              `Product: ${item.name}, Variant: ${
                variant?.attributeRefs?.map((ref) => ref.value).join("/") ||
                "N/A"
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
            (sum, item) => sum + (item.offerPrice || 0) * (item.quantity || 1),
            0
          );

          console.log("Total Value Calculated:", totalValue, "VNĐ");

          const payload = {
            pick_province: "TP. Hồ Chí Minh",
            pick_district: "Quận 3",
            pick_address: "123 Đường Lấy Hàng, Quận 3",
            province:
              defaultAddress.city === "Hồ Chí Minh"
                ? "TP. Hồ Chí Minh"
                : defaultAddress.city || "TP. Hồ Chí Minh",
            district: defaultAddress.state.startsWith("Quận")
              ? defaultAddress.state
              : `Quận ${defaultAddress.state}` || "Quận 1",
            ward: defaultAddress.ward?.startsWith("Phường")
              ? defaultAddress.ward
              : `Phường ${defaultAddress.ward || "1"}`,
            address: defaultAddress.area || "123 Nguyễn Chí Thanh",
            weight: totalWeight,
            value: totalValue,
            transport: "road",
          
            products: Object.values(cartItems).map((item) => {
              const productId = item.productId;
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
              const color = variant?.attributeRefs?.find(
                (ref) => ref.attributeId.name === "Màu sắc"
              )?.value;
              const storage = variant?.attributeRefs?.find(
                (ref) => ref.attributeId.name === "Dung lượng"
              )?.value;
              return {
                name: item.name,
                weight: weight,
                quantity: item.quantity || 1,
                sku: variant?.sku,
                attributes: {
                  color: color || "N/A",
                  storage: storage || "N/A",
                },
              };
            }),
          };

          console.log(
            "Payload sent to GHTK:",
            JSON.stringify(payload, null, 2)
          );

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
              console.log(
                "Shipping Fee Calculated:",
                response.data.data.fee.fee
              );
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
    }
  }, [isDataReady, defaultAddress, cartItems, specifications, variants]);

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
    console.log("Variants fetched:", JSON.stringify(variants, null, 2));
    console.log("Default Address:", JSON.stringify(defaultAddress, null, 2));
  }, [cartItems, specifications, variants, defaultAddress]);

  // Kiểm tra trước khi chuyển sang /checkout
  const handleCheckout = () => {
    if (!defaultAddress) {
      toast.error("Vui lòng thêm địa chỉ giao hàng trước khi thanh toán!");
      router.push("/add-address");
      return;
    }
    if (Object.keys(cartItems).length === 0) {
      toast.error("Giỏ hàng trống, vui lòng thêm sản phẩm!");
      return;
    }
    if (!shippingFee && shippingFee !== 0) {
      toast.error("Vui lòng đợi tính phí vận chuyển trước khi thanh toán!");
      return;
    }
    router.push("/checkout");
  };

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
                {Object.entries(cartItems).map(([itemKey, item]) => {
                  const [productId] = itemKey.split("_");
                  const variant = variants[productId]?.find(
                    (v) => v._id.toString() === item.variantId
                  );
                  const color = variant?.attributeRefs?.find(
                    (ref) => ref.attributeId.name === "Màu sắc"
                  )?.value;
                  const storage = variant?.attributeRefs?.find(
                    (ref) => ref.attributeId.name === "Dung lượng"
                  )?.value;

                  const price = item.offerPrice || variant?.offerPrice || 0;

                  return (
                    <tr key={itemKey}>
                      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                        <div>
                          <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
                            {variant?.image || item.image ? (
                              <Image
                                src={variant?.image || item.image}
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
                            onClick={() => updateCartQuantity(itemKey, 0)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-sm hidden md:block">
                          <p className="text-gray-800">
                            {item.name} {color && `(${color}`}
                            {storage && `/${storage})`}
                          </p>
                          <button
                            className="text-xs text-orange-600 mt-1"
                            onClick={() => updateCartQuantity(itemKey, 0)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">
                        {formatCurrency(price)}
                      </td>
                      <td className="py-4 md:px-4 px-1">
                        <div className="flex items-center md:gap-2 gap-1">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                itemKey,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Image
                              src={assets.decrease_arrow}
                              alt="decrease_arrow"
                              className="w-4 h-4"
                            />
                          </button>
                          <input
                            onChange={(e) => {
                              const newQuantity = Math.max(
                                1,
                                Number(e.target.value)
                              );
                              updateCartQuantity(itemKey, newQuantity);
                            }}
                            type="number"
                            value={item.quantity}
                            className="w-8 border text-center appearance-none"
                            min="1"
                          />
                          <button
                            onClick={() =>
                              updateCartQuantity(itemKey, item.quantity + 1)
                            }
                            disabled={
                              variant?.stock && item.quantity >= variant?.stock
                            }
                          >
                            <Image
                              src={assets.increase_arrow}
                              alt="increase_arrow"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">
                        {formatCurrency(price * item.quantity)}
                      </td>
                    </tr>
                  );
                })}
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
          <button
            onClick={handleCheckout}
            className="mt-4 w-full px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Thanh Toán
          </button>
        </div>
      </div>
    </>
  );
};

export default Cart;
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
// import mongoose from "mongoose";

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
//   const [variants, setVariants] = useState({});
//   const [isDataReady, setIsDataReady] = useState(false);

//   useEffect(() => {
//     if (!isSignedIn) {
//       toast.error("Vui lòng đăng nhập để xem giỏ hàng!");
//       router.push("/sign-in");
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         const fetchDefaultAddress = async () => {
//           try {
//             const token = await getToken();
//             const headers = token ? { Authorization: `Bearer ${token}` } : {};
//             const { data } = await axios.get("/api/address/default", {
//               headers,
//             });
//             console.log("Default Address Response:", data);
//             if (data.success) {
//               if (data.address) {
//                 setDefaultAddress(data.address);
//               } else {
//                 toast.error(
//                   "Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ!"
//                 );
//                 router.push("/add-address");
//               }
//             } else {
//               toast.error(data.message);
//             }
//           } catch (error) {
//             console.error("Fetch Default Address Error:", error.message);
//             toast.error("Không thể lấy địa chỉ mặc định. Vui lòng thử lại!");
//           }
//         };

//         const fetchSpecificationsAndVariants = async () => {
//           const maxRetries = 3;
//           for (let attempt = 1; attempt <= maxRetries; attempt++) {
//             try {
//               const itemIds = Object.keys(cartItems);
//               if (itemIds.length === 0) {
//                 setSpecifications({});
//                 setVariants({});
//                 return;
//               }

//               const productIds = itemIds.map((id) => id.split("_")[0]);
//               const validProductIds = productIds.filter((id) =>
//                 mongoose.Types.ObjectId.isValid(id)
//               );
//               if (validProductIds.length === 0) {
//                 console.warn(
//                   "No valid product IDs found in cartItems:",
//                   itemIds
//                 );
//                 setSpecifications({});
//                 setVariants({});
//                 return;
//               }

//               const token = await getToken();
//               const headers = token ? { Authorization: `Bearer ${token}` } : {};
//               const specResponse = await axios.post(
//                 "/api/specifications/list",
//                 { productIds: validProductIds },
//                 { headers }
//               );
//               if (specResponse.data.success) {
//                 const specs = specResponse.data.specifications.reduce(
//                   (acc, spec) => {
//                     acc[spec.productId] = spec.specs;
//                     return acc;
//                   },
//                   {}
//                 );
//                 setSpecifications(specs);
//               }

//               const variantPromises = validProductIds.map(async (id) => {
//                 const response = await axios.get(`/api/product/${id}`, {
//                   headers,
//                 });
//                 if (response.data.success) {
//                   const product = response.data.product;
//                   const productVariants = product.variants || [];
//                   console.log(
//                     "Fetched variants for product",
//                     id,
//                     productVariants
//                   );
//                   return { [id]: productVariants };
//                 }
//                 return { [id]: [] };
//               });
//               const variantResults = await Promise.all(variantPromises);
//               const variantsData = variantResults.reduce(
//                 (acc, curr) => ({ ...acc, ...curr }),
//                 {}
//               );
//               setVariants(variantsData);
//               break;
//             } catch (error) {
//               console.error(
//                 `Fetch Specifications/Variants Error (Attempt ${attempt}/${maxRetries}):`,
//                 {
//                   message: error.message,
//                   response: error.response?.data,
//                   status: error.response?.status,
//                 }
//               );
//               if (attempt === maxRetries) {
//                 toast.error(
//                   "Không thể lấy thông số kỹ thuật hoặc biến thể sau nhiều lần thử!"
//                 );
//               } else {
//                 await new Promise((resolve) =>
//                   setTimeout(resolve, 1000 * attempt)
//                 );
//               }
//             }
//           }
//         };

//         await Promise.all([
//           fetchDefaultAddress(),
//           fetchSpecificationsAndVariants(),
//         ]);
//         setIsDataReady(true); // Đánh dấu dữ liệu đã sẵn sàng
//       } catch (error) {
//         console.error("Fetch Data Error:", error.message);
//         toast.error("Lỗi khi tải dữ liệu giỏ hàng!");
//       }
//     };

//     fetchData();
//   }, [isSignedIn, getToken, router, cartItems]);

//   useEffect(() => {
//     if (isDataReady && defaultAddress && Object.keys(cartItems).length > 0) {
//       const calculateShippingFee = async () => {
//         if (
//           !defaultAddress ||
//           !defaultAddress.city ||
//           !defaultAddress.state ||
//           !defaultAddress.area ||
//           Object.keys(cartItems).length === 0
//         ) {
//           console.log(
//             "Skipping shipping fee calculation: No valid address or cart items",
//             { defaultAddress }
//           );
//           return;
//         }

//         const itemIds = Object.keys(cartItems).map((key) => key.split("_")[0]); // Lấy productId
//         if (
//           itemIds.some(
//             (id) => !specifications[id] || !specifications[id].length
//           )
//         ) {
//           console.log(
//             "Skipping shipping fee calculation: Specifications not fully fetched",
//             { specifications }
//           );
//           return;
//         }

//         try {
//           const totalWeight = Object.values(cartItems).reduce((sum, item) => {
//             const productId = item.productId; // Sử dụng productId từ cartItems
//             const variant = variants[productId]?.find(
//               (v) => v._id.toString() === item.variantId
//             );
//             const specs = specifications[productId] || [];
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
//             const quantity = item.quantity || 1;
//             console.log(
//               `Product: ${item.name}, Variant: ${
//                 variant?.attributeRefs?.map((ref) => ref.value).join("/") ||
//                 "N/A"
//               }, Weight: ${weight}g, Quantity: ${quantity}, Subtotal Weight: ${
//                 weight * quantity
//               }g`
//             );
//             return sum + (variant?.weight || weight) * quantity;
//           }, 0);

//           console.log("Total Weight Calculated:", totalWeight, "g");

//           if (totalWeight <= 0) {
//             throw new Error("Total weight must be greater than 0");
//           }

//           const totalValue = Object.values(cartItems).reduce(
//             (sum, item) => sum + (item.offerPrice || 0) * (item.quantity || 1),
//             0
//           );

//           console.log("Total Value Calculated:", totalValue, "VNĐ");

//           const payload = {
//             pick_province: "TP. Hồ Chí Minh",
//             pick_district: "Quận 3",
//             pick_address: "123 Đường Lấy Hàng, Quận 3",
//             province:
//               defaultAddress.city === "Hồ Chí Minh"
//                 ? "TP. Hồ Chí Minh"
//                 : defaultAddress.city || "TP. Hồ Chí Minh",
//             district: defaultAddress.state.startsWith("Quận")
//               ? defaultAddress.state
//               : `Quận ${defaultAddress.state}` || "Quận 1",
//             ward: defaultAddress.ward?.startsWith("Phường")
//               ? defaultAddress.ward
//               : `Phường ${defaultAddress.ward || "1"}`,
//             address: defaultAddress.area || "123 Nguyễn Chí Thanh",
//             weight: totalWeight,
//             value: totalValue,
//             transport: "road",
//             deliver_option: "none",
//             products: Object.values(cartItems).map((item) => {
//               const productId = item.productId;
//               const variant = variants[productId]?.find(
//                 (v) => v._id.toString() === item.variantId
//               );
//               const specs = specifications[productId] || [];
//               let weight = 100;
//               const weightSpec = specs.find(
//                 (s) => s.key.toLowerCase() === "trọng lượng"
//               );
//               if (weightSpec) {
//                 const weightValue = parseFloat(
//                   weightSpec.value.replace(/[^0-9.]/g, "")
//                 );
//                 if (!isNaN(weightValue)) weight = weightValue;
//               }
//               const color = variant?.attributeRefs?.find(
//                 (ref) => ref.attributeId.name === "Màu sắc"
//               )?.value;
//               const storage = variant?.attributeRefs?.find(
//                 (ref) => ref.attributeId.name === "Dung lượng"
//               )?.value;
//               return {
//                 name: item.name,
//                 weight: variant?.weight || weight,
//                 quantity: item.quantity || 1,
//                 sku: variant?.sku,
//                 attributes: {
//                   color: color || "N/A",
//                   storage: storage || "N/A",
//                 },
//               };
//             }),
//           };

//           console.log(
//             "Payload sent to GHTK:",
//             JSON.stringify(payload, null, 2)
//           );

//           const token = await getToken();
//           const headers = token ? { Authorization: `Bearer ${token}` } : {};
//           const response = await axios.post(
//             "/api/ghtk",
//             {
//               action: "calculateFee",
//               payload,
//             },
//             { headers }
//           );

//           if (!response.data) {
//             throw new Error("GHTK response is empty");
//           }

//           console.log(
//             "GHTK Response from Client:",
//             JSON.stringify(response.data, null, 2)
//           );
//           if (response.data.success && response.data.data?.success) {
//             if (response.data.data.fee?.fee) {
//               setShippingFee(response.data.data.fee.fee);
//               console.log(
//                 "Shipping Fee Calculated:",
//                 response.data.data.fee.fee
//               );
//             } else {
//               throw new Error("GHTK response missing fee data");
//             }
//           } else {
//             const errorMessage =
//               response.data.data?.message ||
//               response.data.message ||
//               "GHTK failed to calculate fee";
//             console.log(
//               "GHTK Error Response:",
//               JSON.stringify(response.data, null, 2)
//             );
//             throw new Error(errorMessage);
//           }
//         } catch (error) {
//           console.error("Calculate Shipping Fee Error:", error.message);
//           setShippingFee(0);
//           toast.error("Không thể tính phí vận chuyển: " + error.message);
//         }
//       };

//       calculateShippingFee();
//     }
//   }, [isDataReady, defaultAddress, cartItems, specifications, variants]);

//   useEffect(() => {
//     console.log("Shipping Fee State Updated in Cart:", shippingFee);
//   }, [shippingFee]);

//   useEffect(() => {
//     console.log("Cart Items:", cartItems);
//   }, [cartItems]);

//   useEffect(() => {
//     console.log("Cart Items in Cart Page:", JSON.stringify(cartItems, null, 2));
//     console.log(
//       "Specifications fetched:",
//       JSON.stringify(specifications, null, 2)
//     );
//     console.log("Variants fetched:", JSON.stringify(variants, null, 2));
//     console.log("Default Address:", JSON.stringify(defaultAddress, null, 2));
//   }, [cartItems, specifications, variants, defaultAddress]);

//   const handleCheckout = () => {
//     if (!isSignedIn) {
//       toast.error("Vui lòng đăng nhập để thanh toán!");
//       router.push("/sign-in");
//       return;
//     }
//     if (Object.keys(cartItems).length === 0) {
//       toast.error("Giỏ hàng trống! Vui lòng thêm sản phẩm.");
//       return;
//     }
//     if (!defaultAddress) {
//       toast.error("Vui lòng thêm địa chỉ giao hàng trước khi thanh toán!");
//       router.push("/add-address");
//       return;
//     }
//     router.push("/checkout");
//   };

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
//                 {Object.entries(cartItems).map(([itemKey, item]) => {
//                   const [productId] = itemKey.split("_");
//                   const variant = variants[productId]?.find(
//                     (v) => v._id.toString() === item.variantId
//                   );
//                   const color = variant?.attributeRefs?.find(
//                     (ref) => ref.attributeId.name === "Màu sắc"
//                   )?.value;
//                   const storage = variant?.attributeRefs?.find(
//                     (ref) => ref.attributeId.name === "Dung lượng"
//                   )?.value;

//                   const price = item.offerPrice || variant?.offerPrice || 0;

//                   return (
//                     <tr key={itemKey}>
//                       <td className="flex items-center gap-4 py-4 md:px-4 px-1">
//                         <div>
//                           <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
//                             {variant?.image || item.image ? (
//                               <Image
//                                 src={variant?.image || item.image}
//                                 alt={item.name}
//                                 className="w-16 h-auto object-cover mix-blend-multiply"
//                                 width={1280}
//                                 height={720}
//                               />
//                             ) : (
//                               <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
//                                 <span className="text-gray-500">No Image</span>
//                               </div>
//                             )}
//                           </div>
//                           <button
//                             className="md:hidden text-xs text-orange-600 mt-1"
//                             onClick={() => updateCartQuantity(itemKey, 0)}
//                           >
//                             Remove
//                           </button>
//                         </div>
//                         <div className="text-sm hidden md:block">
//                           <p className="text-gray-800">
//                             {item.name} {color && `(${color}`}
//                             {storage && `/${storage})`}
//                           </p>
//                           <button
//                             className="text-xs text-orange-600 mt-1"
//                             onClick={() => updateCartQuantity(itemKey, 0)}
//                           >
//                             Remove
//                           </button>
//                         </div>
//                       </td>
//                       <td className="py-4 md:px-4 px-1 text-gray-600">
//                         {formatCurrency(price)}
//                       </td>
//                       <td className="py-4 md:px-4 px-1">
//                         <div className="flex items-center md:gap-2 gap-1">
//                           <button
//                             onClick={() =>
//                               updateCartQuantity(
//                                 itemKey,
//                                 Math.max(1, item.quantity - 1)
//                               )
//                             }
//                             disabled={item.quantity <= 1}
//                           >
//                             <Image
//                               src={assets.decrease_arrow}
//                               alt="decrease_arrow"
//                               className="w-4 h-4"
//                             />
//                           </button>
//                           <input
//                             onChange={(e) => {
//                               const newQuantity = Math.max(
//                                 1,
//                                 Number(e.target.value)
//                               );
//                               updateCartQuantity(itemKey, newQuantity);
//                             }}
//                             type="number"
//                             value={item.quantity}
//                             className="w-8 border text-center appearance-none"
//                             min="1"
//                           />
//                           <button
//                             onClick={() =>
//                               updateCartQuantity(itemKey, item.quantity + 1)
//                             }
//                             disabled={
//                               variant?.stock && item.quantity >= variant?.stock
//                             }
//                           >
//                             <Image
//                               src={assets.increase_arrow}
//                               alt="increase_arrow"
//                               className="w-4 h-4"
//                             />
//                           </button>
//                         </div>
//                       </td>
//                       <td className="py-4 md:px-4 px-1 text-gray-600">
//                         {formatCurrency(price * item.quantity)}
//                       </td>
//                     </tr>
//                   );
//                 })}
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
//           <button
//             onClick={handleCheckout}
//             className="mt-4 w-full px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
//           >
//             Thanh Toán
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Cart;
