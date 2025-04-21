"use client";

import { useUser } from "@clerk/nextjs";
import Script from "next/script";

export default function TawkToWidget() {
  const { user, isLoaded } = useUser();

  // Nếu chưa tải xong user, không hiển thị widget
  if (!isLoaded) {
    return null;
  }

  // Chỉ hiển thị widget cho người không phải seller
  const shouldShowWidget =
    !user || (user && user.publicMetadata?.role !== "seller");

  if (!shouldShowWidget) {
    return null;
  }

  // Hàm thiết lập thông tin user cho Tawk.to
  const setTawkUser = () => {
    if (window.Tawk_API) {
      window.Tawk_API.onLoad = function () {
        if (user) {
          // Gửi thông tin user đến Tawk.to
          window.Tawk_API.setAttributes(
            {
              name: user.fullName || "Guest",
              email: user.primaryEmailAddress?.emailAddress || "",
              id: user.id, // ID duy nhất của user từ Clerk
            },
            function (error) {
              if (error) {
                console.error("Tawk.to setAttributes error:", error);
              }
            }
          );
        }
      };
    }
  };

  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://embed.tawk.to/67eab178e6a49f1909c1814c/1inmcag89"
        charset="UTF-8"
        crossOrigin="*"
        async
        onLoad={setTawkUser} // Gọi hàm thiết lập user sau khi script tải xong
      />
    </>
  );
}
