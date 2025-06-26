// 'use client'
// import { assets } from '@/assets/assets'
// import { useAppContext } from '@/context/AppContext'
// import Image from 'next/image'
// import { useEffect } from 'react'

// const OrderPlaced = () => {

//   const { router } = useAppContext()

//   useEffect(() => {
//     setTimeout(() => {
//       router.push('/my-orders')
//     }, 5000)
//   }, [])

//   return (
//     <div className='h-screen flex flex-col justify-center items-center gap-5'>
//       <div className="flex justify-center items-center relative">
//         <Image className="absolute p-5" src={assets.checkmark} alt='' />
//         <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-300 border-gray-200"></div>
//       </div>
//       <div className="text-center text-2xl font-semibold">Đặt Hàng Thành Công</div>
//     </div>
//   )
// }

// export default OrderPlaced
"use client";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useEffect } from "react";

const OrderPlaced = () => {
  const { router } = useAppContext();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/my-orders");
    }, 5000);

    return () => clearTimeout(timeout); // Cleanup để tránh memory leak
  }, [router]);

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-5">
      <div className="flex justify-center items-center relative">
        <Image
          className="absolute p-5"
          src={assets.checkmark}
          alt="checkmark"
          width={48}
          height={48}
        />
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-400 border-gray-200"></div>
      </div>
      <div className="text-center text-2xl font-semibold text-green-600">
        🎉 Đặt hàng thành công!
      </div>
      <div className="text-gray-500">
        Đang chuyển hướng đến đơn hàng của bạn...
      </div>
    </div>
  );
};

export default OrderPlaced;
