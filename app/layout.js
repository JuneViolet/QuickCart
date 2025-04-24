// import { Outfit } from "next/font/google";
// import "./globals.css";
// import { AppContextProvider } from "@/context/AppContext";
// import { Toaster } from "react-hot-toast";
// import { ClerkProvider } from "@clerk/nextjs";

// const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500"] });

// export const metadata = {
//   title: "TechTrend - Thiết Bị Điện Tử Hiện Đại & Giá Tốt",
//   description: "TechTrend chuyên cung cấp laptop, smartphone, phụ kiện công nghệ chính hãng với giá ưu đãi, bảo hành uy tín, giao hàng nhanh toàn quốc.",
// };

// export default function RootLayout({ children }) {
//   return (
//     <ClerkProvider>
//       <html lang="en">
//         <body className={`${outfit.className} antialiased text-gray-700`}>
//           <Toaster />
//           <AppContextProvider>{children}</AppContextProvider>
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500"] });

export const metadata = {
  title: "TechTrend - Thiết Bị Điện Tử Hiện Đại & Giá Tốt",
  description:
    "TechTrend chuyên cung cấp laptop, smartphone, phụ kiện công nghệ chính hãng với giá ưu đãi, bảo hành uy tín, giao hàng nhanh toàn quốc.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          // Cho User Menu (<UserButton />)
          userButtonFooter: { display: "none" },
          menuFooter: { display: "none" },
          userButtonPopoverFooter: { display: "none" },

          // Cho User Profile (Manage Account - <UserProfile />)
          userProfileFooter: { display: "none" },
          profileFooter: { display: "none" },
          userProfileBranding: { display: "none" },
          footerBrandingLogo: { display: "none" }, // Thử tên mới
          clerkFooter: { display: "none" }, // Thử tên mới

          // Thử ẩn branding tổng quát
          branding: { display: "none" },
          clerkBranding: { display: "none" },

          // Giữ lại các tùy chọn khác
          footer: { display: "none" },
          footerBranding: { display: "none" },
        },
      }}
    >
      <html lang="en">
        <body className={`${outfit.className} antialiased text-gray-700`}>
          <Toaster />
          <AppContextProvider>{children}</AppContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
