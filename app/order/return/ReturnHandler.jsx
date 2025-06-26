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
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");

    if (vnp_ResponseCode) {
      setLoading(false);
      if (vnp_ResponseCode === "00") {
        toast.success("Thanh toán thành công!");
        router.push("/order-placed");
      } else {
        toast.error(`Thanh toán thất bại: ${vnp_ResponseCode}`);
        router.push("/cart");
      }
    }
  }, [searchParams]);

  return <div>{loading ? "Đang xử lý..." : "Kết quả thanh toán"}</div>;
}
