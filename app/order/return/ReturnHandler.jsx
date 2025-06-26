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
