// import { Outfit } from "next/font/google";
// import "./globals.css";
// import { AppContextProvider } from "@/context/AppContext";
// import { Toaster } from "react-hot-toast";
// import { ClerkProvider } from "@clerk/nextjs";

// const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500"] });

// export const metadata = {
//   title: "QuickCart - GreatStack",
//   description: "E-Commerce with Next.js ",
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
// import { Outfit } from "next/font/google";
// import "./globals.css";
// import { AppContextProvider } from "@/context/AppContext";
// import { Toaster } from "react-hot-toast";
// import { ClerkProvider } from "@clerk/nextjs";
// import TawkToWidget from "@/components/TawkToWidget"; // Import component mới

// const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500"] });

// export const metadata = {
//   title: "QuickCart - GreatStack",
//   description: "E-Commerce with Next.js ",
// };

// export default function RootLayout({ children }) {
//   return (
//     <ClerkProvider>
//       <html lang="en">
//         <body className={`${outfit.className} antialiased text-gray-700`}>
//           <Toaster />
//           <AppContextProvider>{children}</AppContextProvider>
//           <TawkToWidget /> {/* Widget Tawk.to chỉ hiển thị cho khách hàng */}
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
  description: "TechTrend chuyên cung cấp laptop, smartphone, phụ kiện công nghệ chính hãng với giá ưu đãi, bảo hành uy tín, giao hàng nhanh toàn quốc.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.className} antialiased text-gray-700`}>
          <Toaster />
          <AppContextProvider>{children}</AppContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
