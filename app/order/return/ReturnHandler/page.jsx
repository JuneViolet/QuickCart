"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function ReturnHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");

    if (vnp_ResponseCode) {
      if (vnp_ResponseCode === "00") {
        toast.success("Thanh toán thành công!");
        router.push("/order-placed");
      } else {
        toast.error(`Thanh toán thất bại: Mã ${vnp_ResponseCode}`);
        router.push("/cart");
      }
    }
  }, [searchParams, router]);

  return null; // Không cần render gì cả
}
