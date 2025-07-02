//app/order/return/ReturnHandle.jsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ReturnHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchParams) return;

    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");

    if (vnp_ResponseCode !== null) {
      if (vnp_ResponseCode === "00") {
        toast.success("🎉 Thanh toán thành công!");
        router.replace("/order-placed"); // dùng replace tránh back lại trang này
      } else {
        toast.error(`❌ Thanh toán thất bại. Mã: ${vnp_ResponseCode}`);
        router.replace("/cart");
      }
      setLoading(false);
    }
  }, [searchParams, router]);

  return (
    <div className="text-center py-10 text-lg font-semibold">
      {loading
        ? "⏳ Đang xử lý kết quả thanh toán..."
        : "🔁 Đang chuyển trang..."}
    </div>
  );
}
// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { useAppContext } from "@/context/AppContext"; // Import context

// export default function ReturnHandler() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const { getToken } = useAppContext(); // Lấy getToken từ context

//   useEffect(() => {
//     const handlePaymentResult = async () => {
//       if (!searchParams) return;

//       const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
//       const vnp_TxnRef = searchParams.get("vnp_TxnRef");

//       if (vnp_ResponseCode !== null) {
//         try {
//           let token = null;
//           try {
//             token = await getToken(); // Thử lấy token
//           } catch (tokenError) {
//             console.warn("Failed to get token:", tokenError);
//             // Tiếp tục mà không cần token nếu không bắt buộc
//           }

//           const headers = token ? { Authorization: `Bearer ${token}` } : {};
//           const response = await axios.post(
//             "/api/order/verify-payment",
//             { trackingCode: vnp_TxnRef, responseCode: vnp_ResponseCode },
//             { headers }
//           );

//           if (response.data.success) {
//             if (vnp_ResponseCode === "00") {
//               toast.success("🎉 Thanh toán thành công!");
//               router.replace("/order-placed");
//             } else {
//               toast.error(`❌ Thanh toán thất bại. Mã: ${vnp_ResponseCode}`);
//               router.replace("/cart");
//             }
//           } else {
//             toast.error("Lỗi xác nhận thanh toán: " + response.data.message);
//             router.replace("/cart");
//           }
//         } catch (error) {
//           console.error("Payment verification error:", error);
//           toast.error("Lỗi server khi xác nhận thanh toán");
//           router.replace("/cart");
//         }
//       }
//       setLoading(false);
//     };

//     handlePaymentResult();
//   }, [searchParams, router, getToken]); // Thêm getToken vào dependencies

//   return (
//     <div className="text-center py-10 text-lg font-semibold">
//       {loading
//         ? "⏳ Đang xử lý kết quả thanh toán..."
//         : "🔁 Đang chuyển trang..."}
//     </div>
//   );
// }
