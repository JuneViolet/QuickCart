"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function OrderReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const vnp_TxnRef = searchParams.get("vnp_TxnRef");
    const vnp_Amount = searchParams.get("vnp_Amount");
    const vnp_TransactionNo = searchParams.get("vnp_TransactionNo");

    if (vnp_ResponseCode) {
      setLoading(false);

      if (vnp_ResponseCode === "00") {
        toast.success("Thanh toán thành công!");
        router.push("/order-placed");
      } else {
        toast.error(`Thanh toán thất bại: Mã ${vnp_ResponseCode}`);
        router.push("/cart");
      }
    }
  }, [searchParams, router]);

  return (
    <div>
      {loading
        ? "Đang xử lý kết quả thanh toán..."
        : "Xử lý xong kết quả thanh toán."}
    </div>
  );
}
export const dynamic = "force-dynamic"; // Dùng runtime rendering
