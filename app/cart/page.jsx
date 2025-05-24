// 'use client'
// import React from "react";
// import { assets } from "@/assets/assets";
// import OrderSummary from "@/components/OrderSummary";
// import Image from "next/image";
// import Navbar from "@/components/Navbar";
// import { useAppContext } from "@/context/AppContext";

// const Cart = () => {

//   const { products, router, cartItems, addToCart, updateCartQuantity, getCartCount } = useAppContext();

//   return (
//     <>
//       <Navbar />
//       <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
//         <div className="flex-1">
//           <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
//             <p className="text-2xl md:text-3xl text-gray-500">
//               Giỏ <span className="font-medium text-orange-600">Hàng</span>
//             </p>
//             <p className="text-lg md:text-xl text-gray-500/80">{getCartCount()} Sản Phẩm</p>
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
//                 {Object.keys(cartItems).map((itemId) => {
//                   const product = products.find(product => product._id === itemId);

//                   if (!product || cartItems[itemId] <= 0) return null;

//                   return (
//                     <tr key={itemId}>
//                       <td className="flex items-center gap-4 py-4 md:px-4 px-1">
//                         <div>
//                           <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
//                             <Image
//                               src={product.image[0]}
//                               alt={product.name}
//                               className="w-16 h-auto object-cover mix-blend-multiply"
//                               width={1280}
//                               height={720}
//                             />
//                           </div>
//                           <button
//                             className="md:hidden text-xs text-orange-600 mt-1"
//                             onClick={() => updateCartQuantity(product._id, 0)}
//                           >
//                             Remove
//                           </button>
//                         </div>
//                         <div className="text-sm hidden md:block">
//                           <p className="text-gray-800">{product.name}</p>
//                           <button
//                             className="text-xs text-orange-600 mt-1"
//                             onClick={() => updateCartQuantity(product._id, 0)}
//                           >
//                             Remove
//                           </button>
//                         </div>
//                       </td>
//                       <td className="py-4 md:px-4 px-1 text-gray-600">{product.offerPrice}VNĐ</td>
//                       <td className="py-4 md:px-4 px-1">
//                         <div className="flex items-center md:gap-2 gap-1">
//                           <button onClick={() => updateCartQuantity(product._id, cartItems[itemId] - 1)}>
//                             <Image
//                               src={assets.decrease_arrow}
//                               alt="decrease_arrow"
//                               className="w-4 h-4"
//                             />
//                           </button>
//                           <input onChange={e => updateCartQuantity(product._id, Number(e.target.value))} type="number" value={cartItems[itemId]} className="w-8 border text-center appearance-none"></input>
//                           <button onClick={() => addToCart(product._id)}>
//                             <Image
//                               src={assets.increase_arrow}
//                               alt="increase_arrow"
//                               className="w-4 h-4"
//                             />
//                           </button>
//                         </div>
//                       </td>
//                       <td className="py-4 md:px-4 px-1 text-gray-600">{(product.offerPrice * cartItems[itemId]).toFixed(2)}VNĐ</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//           <button onClick={()=> router.push('/all-products')} className="group flex items-center mt-6 gap-2 text-orange-600">
//             <Image
//               className="group-hover:-translate-x-1 transition"
//               src={assets.arrow_right_icon_colored}
//               alt="arrow_right_icon_colored"
//             />
//             Tiếp Tục Shopping
//           </button>
//         </div>
//         <OrderSummary />
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

const Cart = () => {
  const {
    router,
    cartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    formatCurrency,
  } = useAppContext();
  const [cartProducts, setCartProducts] = useState([]);

  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const itemIds = Object.keys(cartItems).filter(
          (itemId) => cartItems[itemId] > 0
        );
        if (itemIds.length === 0) {
          setCartProducts([]);
          return;
        }

        const response = await fetch("/api/product/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: itemIds }),
        });
        const data = await response.json();
        console.log("Cart Products API Response:", data);
        if (data.success) {
          setCartProducts(data.products || []);
        } else {
          console.error("Fetch Cart Products Error:", data.message);
          setCartProducts([]);
        }
      } catch (error) {
        console.error("Fetch Cart Products Error:", error.message);
        setCartProducts([]);
      }
    };

    fetchCartProducts();
  }, [cartItems]);

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
                {Object.keys(cartItems).map((itemId) => {
                  const product = cartProducts.find(
                    (product) => product._id === itemId
                  );

                  if (!product || cartItems[itemId] <= 0) return null;

                  return (
                    <tr key={itemId}>
                      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                        <div>
                          <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0]} // Sửa từ image thành images
                                alt={product.name}
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
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-sm hidden md:block">
                          <p className="text-gray-800">{product.name}</p>
                          <button
                            className="text-xs text-orange-600 mt-1"
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">
                        {formatCurrency(product.offerPrice)}
                      </td>
                      <td className="py-4 md:px-4 px-1">
                        <div className="flex items-center md:gap-2 gap-1">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                product._id,
                                cartItems[itemId] - 1
                              )
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
                              updateCartQuantity(
                                product._id,
                                Number(e.target.value)
                              )
                            }
                            type="number"
                            value={cartItems[itemId]}
                            className="w-8 border text-center appearance-none"
                          />
                          <button onClick={() => addToCart(product._id)}>
                            <Image
                              src={assets.increase_arrow}
                              alt="increase_arrow"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">
                        {formatCurrency(product.offerPrice * cartItems[itemId])}
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
        <OrderSummary />
      </div>
    </>
  );
};

export default Cart;
