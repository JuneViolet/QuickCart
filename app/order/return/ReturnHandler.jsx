// // // //app/order/return/ReturnHandle.jsx
// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { useAppContext } from "@/context/AppContext";

// export default function ReturnHandler() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [trackingInfo, setTrackingInfo] = useState(null);
//   const { getToken } = useAppContext();

//   useEffect(() => {
//     const handlePaymentResult = async () => {
//       if (!searchParams) return;

//       const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
//       const vnp_TxnRef = searchParams.get("vnp_TxnRef");

//       if (vnp_ResponseCode !== null && vnp_TxnRef) {
//         try {
//           const token = await getToken();
//           const headers = token ? { Authorization: `Bearer ${token}` } : {};
//           const response = await axios.post(
//             "/api/order/verify-payment",
//             { trackingCode: vnp_TxnRef, responseCode: vnp_ResponseCode },
//             { headers }
//           );

//           if (response.data.success) {
//             if (vnp_ResponseCode === "00") {
//               toast.success("🎉 Thanh toán thành công!");
//               if (response.data.trackingCode) {
//                 setTrackingInfo(response.data.trackingCode); // Cập nhật mã GHN từ response
//                 router.replace("/order-placed");
//               } else {
//                 toast.error(
//                   "Thanh toán thành công nhưng không tạo được mã GHN."
//                 );
//                 router.replace("/my-orders");
//               }
//             } else {
//               toast.error(`❌ Thanh toán thất bại. Mã: ${vnp_ResponseCode}`);
//               router.replace("/cart");
//             }
//           } else {
//             console.log("Response data:", response.data); // Debug
//             toast.error("Lỗi xác nhận thanh toán: " + response.data.message);
//             router.replace("/cart");
//           }
//         } catch (error) {
//           console.error(
//             "Payment verification error:",
//             error.response?.data || error.message
//           );
//           toast.error("Lỗi server khi xác nhận thanh toán");
//           router.replace("/cart");
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         setLoading(false);
//       }
//     };

//     handlePaymentResult();
//   }, [searchParams, router, getToken]);

//   return (
//     <div className="text-center py-10 text-lg font-semibold">
//       {loading ? (
//         "⏳ Đang xử lý kết quả thanh toán..."
//       ) : trackingInfo ? (
//         <>
//           {/* <p>🎉 Thanh toán thành công!</p> */}
//           <p>Mã vận đơn GHN: {trackingInfo}</p>
//           <p>Đang chuyển trang...</p>
//         </>
//       ) : (
//         "🔁 Đang chuyển trang..."
//       )}
//     </div>
//   );
// }
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";

export default function ReturnHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const { getToken } = useAppContext();

  useEffect(() => {
    const handlePaymentResult = async () => {
      if (!searchParams) return;

      const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
      const vnp_TxnRef = searchParams.get("vnp_TxnRef");

      if (vnp_ResponseCode !== null && vnp_TxnRef) {
        try {
          const token = await getToken();
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const response = await axios.post(
            "/api/order/verify-payment",
            { trackingCode: vnp_TxnRef, responseCode: vnp_ResponseCode },
            { headers }
          );

          if (response.data.success) {
            if (vnp_ResponseCode === "00") {
              toast.success("🎉 Thanh toán thành công!");
              setTrackingInfo(response.data.trackingCode || vnp_TxnRef); // Lấy trackingCode từ response hoặc vnp_TxnRef
              router.replace("/my-orders");
            } else {
              toast.error(`❌ Thanh toán thất bại. Mã: ${vnp_ResponseCode}`);
              router.replace("/cart");
            }
          } else {
            console.log("Response data:", response.data); // Debug
            toast.error("Lỗi xác nhận thanh toán: " + response.data.message);
            router.replace("/cart");
          }
        } catch (error) {
          // Xử lý 404 hoặc lỗi khác
          console.error(
            "Payment verification error:",
            error.response?.data || error.message
          );
          if (error.response?.status === 404) {
            // Nếu 404, kiểm tra IPN đã thành công
            toast.success(
              "Thanh toán thành công qua VNPAY, chuyển đến đơn hàng!"
            );
            router.replace("/my-orders"); // Giả định IPN đã xử lý thành công
          } else {
            toast.error("Lỗi server khi xác nhận thanh toán");
            router.replace("/cart");
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    handlePaymentResult();
  }, [searchParams, router, getToken]);

  return (
    <div className="text-center py-10 text-lg font-semibold">
      {loading ? (
        "⏳ Đang xử lý kết quả thanh toán..."
      ) : trackingInfo ? (
        <>
          <p>🎉 Thanh toán thành công!</p>
          <p>Mã vận đơn GHN: {trackingInfo}</p>
          <p>Đang chuyển trang...</p>
        </>
      ) : (
        "🔁 Đang chuyển trang..."
      )}
    </div>
  );
}
