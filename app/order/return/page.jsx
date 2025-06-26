//app/order/return/page.jsx
"use client";

import { Suspense } from "react";
import ReturnHandler from "./ReturnHandler";

export default function OrderReturnPage() {
  return (
    <Suspense fallback={<div>Đang xử lý kết quả thanh toán...</div>}>
      <ReturnHandler />
    </Suspense>
  );
}
