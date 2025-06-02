// // components/MegaMenu.jsx
// "use client";

// import * as React from "react";
// import Link from "next/link";

// import { cn } from "@/lib/utils";
// import { Icons } from "@/components/icons";

// // Hàm chuẩn hóa chuỗi: loại bỏ dấu tiếng Việt
// const normalizeString = (str) =>
//   str
//     .toLowerCase()
//     .normalize("NFD") // Phân tách dấu thành ký tự riêng
//     .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các ký tự dấu
//     .replace(/đ/g, "d") // Thay "đ" bằng "d"
//     .replace(/ /g, "-") // Thay khoảng trắng bằng "-"
//     .replace(/[^a-z0-9-]/g, ""); // Loại bỏ các ký tự không phải a-z, 0-9, hoặc "-"

// const MegaMenu = ({ categories }) => {
//   return (
//     <ul className="grid w-full gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white shadow-lg border rounded-md">
//       {categories.map((category) => (
//         <li key={category._id}>
//           {console.log("Category name:", category.name)}
//           {console.log(
//             "Generated URL category:",
//             normalizeString(category.name)
//           )}
//           <Link
//             href={`/all-products?category=${normalizeString(category.name)}`}
//             passHref
//             legacyBehavior
//           >
//             <a
//               className={cn(
//                 "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
//               )}
//             >
//               <div className="text-sm font-medium leading-none">
//                 {category.name}
//               </div>
//               <p className="text-sm leading-snug text-muted-foreground">
//                 Xem tất cả sản phẩm {category.name}
//               </p>
//             </a>
//           </Link>
//           {category.subcategories?.length > 0 && (
//             <ul className="ml-4 mt-2 space-y-1">
//               {category.subcategories.map((sub) => (
//                 <li key={sub._id || sub.name}>
//                   {console.log("Subcategory name:", sub.name)}
//                   {console.log(
//                     "Generated URL subcategory:",
//                     normalizeString(sub.name)
//                   )}
//                   <Link
//                     href={`/all-products?category=${normalizeString(sub.name)}`}
//                     passHref
//                     legacyBehavior
//                   >
//                     <a
//                       className={cn(
//                         "block select-none rounded-md p-2 leading-none no-underline text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
//                       )}
//                     >
//                       {sub.name}
//                     </a>
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </li>
//       ))}
//     </ul>
//   );
// };

// export default MegaMenu;
// components/MegaMenu.jsx
"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

// Hàm chuẩn hóa chuỗi
const normalizeString = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");

const MegaMenu = ({ categories }) => {
  return (
    <ul className="grid w-full gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white shadow-lg border rounded-md">
      {categories.map((category) => (
        <li key={category._id}>
          {console.log("Category name:", category.name)}
          {console.log(
            "Generated URL category:",
            normalizeString(category.name)
          )}
          <Link
            href={`/all-products?category=${normalizeString(category.name)}`}
            passHref
            legacyBehavior
          >
            <a
              className={cn(
                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              )}
            >
              <div className="text-sm font-medium leading-none">
                {category.name}
              </div>
              <p className="text-sm leading-snug text-muted-foreground">
                Xem tất cả sản phẩm {category.name}
              </p>
            </a>
          </Link>
          {category.subcategories?.length > 0 && (
            <ul className="ml-4 mt-2 space-y-1">
              {category.subcategories.map((sub) => (
                <li key={sub._id || sub.name}>
                  {console.log("Subcategory name:", sub.name)}
                  {console.log(
                    "Generated URL subcategory:",
                    normalizeString(sub.name)
                  )}
                  <Link
                    href={`/all-products?category=${normalizeString(
                      category.name
                    )}&brand=${normalizeString(sub.name)}`} // Thêm brand vào URL
                    passHref
                    legacyBehavior
                  >
                    <a
                      className={cn(
                        "block select-none rounded-md p-2 leading-none no-underline text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      {sub.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
};

export default MegaMenu;
