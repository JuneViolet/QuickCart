"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function OrderReturn() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkQuery = async () => {
      const { vnp_ResponseCode, vnp_TxnRef, vnp_Amount, vnp_TransactionNo } =
        router.query;
      if (vnp_ResponseCode) {
        setLoading(false);
        if (vnp_ResponseCode === "00") {
          toast.success("Thanh toán thành công!");
          // TODO: Gọi API để lưu đơn hàng nếu chưa có IPN
          router.push("/order-placed");
        } else {
          toast.error(`Thanh toán thất bại: ${vnp_ResponseCode}`);
          router.push("/cart");
        }
      }
    };
    checkQuery();
  }, [router.query]);

  return <div>{loading ? "Đang xử lý..." : "Kết quả thanh toán"}</div>;
}
