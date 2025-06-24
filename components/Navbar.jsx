// // components/Navbar.jsx
// "use client";
// import React, { useState, useEffect } from "react";
// import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
// import Link from "next/link";
// import { useAppContext } from "@/context/AppContext";
// import Image from "next/image";
// import { useClerk, UserButton } from "@clerk/nextjs";
// import {
//   NavigationMenu,
//   NavigationMenuList,
//   NavigationMenuContent,
//   NavigationMenuItem,
//   NavigationMenuTrigger,
// } from "@/components/ui/navigation-menu";
// import MegaMenu from "./MegaMenu";

// const Navbar = () => {
//   const { isSeller, router, user } = useAppContext();
//   const { openSignIn } = useClerk();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [noResults, setNoResults] = useState(false);
//   const [categories, setCategories] = useState([]);

//   const isValidQuery = (query) => {
//     return /[a-zA-Z0-9]/.test(query);
//   };

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await fetch("/api/categorys/mega-menu");
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         if (data.success) {
//           console.log("Fetched categories:", data.categories); // Thêm log để kiểm tra
//           setCategories(data.categories);
//         } else {
//           console.error("API error:", data.message);
//         }
//       } catch (error) {
//         console.error("Error fetching categories:", error.message);
//         setCategories([]);
//       }
//     };
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       setNoResults(false);

//       if (searchQuery.trim() && isValidQuery(searchQuery)) {
//         fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`)
//           .then((res) => res.json())
//           .then((data) => {
//             if (data.error || data.length === 0) {
//               setSuggestions([]);
//               setNoResults(true);
//             } else {
//               setSuggestions(data.slice(0, 5));
//             }
//           })
//           .catch((err) => {
//             console.error("Error fetching suggestions:", err);
//             setSuggestions([]);
//             setNoResults(true);
//           });
//       } else {
//         setSuggestions([]);
//         if (searchQuery.trim()) {
//           setNoResults(true);
//         }
//       }
//     }, 300);

//     return () => clearTimeout(delayDebounceFn);
//   }, [searchQuery]);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (!searchQuery.trim()) {
//       setSuggestions([]);
//       setNoResults(false);
//     }
//   };

//   return (
//     <nav className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
//       {/* Logo và Trigger Mega Menu */}
//       <div className="flex items-center justify-between w-full md:w-auto mb-2 md:mb-0">
//         <Image
//           className="cursor-pointer w-28 md:w-32"
//           onClick={() => router.push("/")}
//           src={assets.logo}
//           alt="logo"
//         />

//         {/* Trigger Mega Menu trên mobile */}
//         <div className="md:hidden">
//           <NavigationMenu>
//             <NavigationMenuList>
//               <NavigationMenuItem>
//                 <NavigationMenuTrigger>Danh Mục</NavigationMenuTrigger>
//                 <NavigationMenuContent className="w-full mt-2">
//                   <MegaMenu categories={categories} />
//                 </NavigationMenuContent>
//               </NavigationMenuItem>
//             </NavigationMenuList>
//           </NavigationMenu>
//         </div>
//       </div>

//       {/* Main navigation items (bao gồm Mega Menu trigger trên desktop) */}
//       <div className="flex items-center gap-4 lg:gap-8 max-md:hidden w-full md:w-auto justify-center">
//         <NavigationMenu>
//           <NavigationMenuList>
//             <NavigationMenuItem>
//               <NavigationMenuTrigger>Danh Mục</NavigationMenuTrigger>
//               <NavigationMenuContent className="w-full mt-2">
//                 <MegaMenu categories={categories} />
//               </NavigationMenuContent>
//             </NavigationMenuItem>
//           </NavigationMenuList>
//         </NavigationMenu>
//         <Link href="/" className="hover:text-gray-900 transition">
//           Trang Chủ
//         </Link>
//         <Link href="/all-products" className="hover:text-gray-900 transition">
//           Shop
//         </Link>
//         <Link href="/about-us" className="hover:text-gray-900 transition">
//           About Us
//         </Link>
//         <Link
//           href="https://www.facebook.com/techtrend.62980/"
//           className="hover:text-gray-900 transition"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Liên Hệ
//         </Link>
//         {isSeller && (
//           <button
//             onClick={() => router.push("/seller")}
//             className="text-xs border px-4 py-1.5 rounded-full"
//           >
//             Admin Dashboard
//           </button>
//         )}
//       </div>

//       {/* Search and User actions */}
//       <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
//         <div className="relative w-full md:w-auto">
//           <form
//             onSubmit={handleSearch}
//             className="flex items-center gap-2 w-full"
//           >
//             <div className="relative w-full">
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Tìm kiếm sản phẩm..."
//                 className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-full"
//               />
//               <button
//                 type="submit"
//                 className="absolute right-2 top-1/2 transform -translate-y-1/2"
//               >
//                 <Image
//                   className="w-4 h-4"
//                   src={assets.search_icon}
//                   alt="search icon"
//                 />
//               </button>
//             </div>
//           </form>
//           {suggestions.length > 0 && (
//             <ul className="absolute top-10 left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
//               {suggestions.map((item) => (
//                 <li key={item._id} className="px-3 py-2 hover:bg-gray-100">
//                   <Link
//                     href={`/product/${item._id}`}
//                     onClick={() => {
//                       setSearchQuery("");
//                       setSuggestions([]);
//                       setNoResults(false);
//                     }}
//                     className="flex items-center gap-3"
//                   >
//                     <Image
//                       src={item.image[0]}
//                       alt={item.name}
//                       width={40}
//                       height={40}
//                       className="w-10 h-10 object-cover rounded"
//                     />
//                     <span>{item.name}</span>
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           )}
//           {noResults && (
//             <div className="absolute top-10 left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 px-3 py-2 text-gray-500">
//               Không tìm thấy sản phẩm
//             </div>
//           )}
//         </div>

//         {user ? (
//           <UserButton
//             appearance={{
//               elements: {
//                 userButtonFooter: { display: "none" },
//                 menuFooter: { display: "none" },
//                 userButtonPopoverFooter: { display: "none" },
//                 branding: { display: "none" },
//                 clerkBranding: { display: "none" },
//                 footerBrandingLogo: { display: "none" },
//                 clerkFooter: { display: "none" },
//                 userButtonBranding: { display: "none" },
//               },
//             }}
//           >
//             <UserButton.MenuItems>
//               <UserButton.Action
//                 label="Giỏ Hàng"
//                 labelIcon={<CartIcon />}
//                 onClick={() => router.push("/cart")}
//               />
//               <UserButton.Action
//                 label="Đơn Đặt Hàng"
//                 labelIcon={<BagIcon />}
//                 onClick={() => router.push("/my-orders")}
//               />
//             </UserButton.MenuItems>
//           </UserButton>
//         ) : (
//           <button
//             onClick={openSignIn}
//             className="flex items-center gap-2 hover:text-gray-900 transition"
//           >
//             <Image src={assets.user_icon} alt="user icon" />
//             Account
//           </button>
//         )}
//       </div>

//       {/* Mobile menu (giữ nguyên cho responsive) */}
//       <div className="flex items-center md:hidden gap-3 w-full">
//         {isSeller && (
//           <button
//             onClick={() => router.push("/seller")}
//             className="text-xs border px-4 py-1.5 rounded-full"
//           >
//             Admin Dashboard
//           </button>
//         )}
//         <div className="relative w-full">
//           <form
//             onSubmit={handleSearch}
//             className="flex items-center gap-2 w-full"
//           >
//             <div className="relative w-full">
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Tìm kiếm..."
//                 className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-full"
//               />
//               <button
//                 type="submit"
//                 className="absolute right-2 top-1/2 transform -translate-y-1/2"
//               >
//                 <Image
//                   className="w-4 h-4"
//                   src={assets.search_icon}
//                   alt="search icon"
//                 />
//               </button>
//             </div>
//           </form>
//           {suggestions.length > 0 && (
//             <ul className="absolute top-10 right-0 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
//               {suggestions.map((item) => (
//                 <li key={item._id} className="px-3 py-2 hover:bg-gray-100">
//                   <Link
//                     href={`/product/${item._id}`}
//                     onClick={() => {
//                       setSearchQuery("");
//                       setSuggestions([]);
//                       setNoResults(false);
//                     }}
//                     className="flex items-center gap-3"
//                   >
//                     <Image
//                       src={item.image[0]}
//                       alt={item.name}
//                       width={40}
//                       height={40}
//                       className="w-10 h-10 object-cover rounded"
//                     />
//                     <span>{item.name}</span>
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           )}
//           {noResults && (
//             <div className="absolute top-10 right-0 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 px-3 py-2 text-gray-500">
//               Không tìm thấy sản phẩm
//             </div>
//           )}
//         </div>
//         {user ? (
//           <UserButton
//             appearance={{
//               elements: {
//                 userButtonFooter: { display: "none" },
//                 menuFooter: { display: "none" },
//                 userButtonPopoverFooter: { display: "none" },
//                 branding: { display: "none" },
//                 clerkBranding: { display: "none" },
//                 footerBrandingLogo: { display: "none" },
//                 clerkFooter: { display: "none" },
//                 userButtonBranding: { display: "none" },
//               },
//             }}
//           >
//             <UserButton.MenuItems>
//               <UserButton.Action
//                 label="Home"
//                 labelIcon={<HomeIcon />}
//                 onClick={() => router.push("/")}
//               />
//               <UserButton.Action
//                 label="Sản Phẩm"
//                 labelIcon={<BoxIcon />}
//                 onClick={() => router.push("/all-products")}
//               />
//               <UserButton.Action
//                 label="Giỏ Hàng"
//                 labelIcon={<CartIcon />}
//                 onClick={() => router.push("/cart")}
//               />
//               <UserButton.Action
//                 label="Đơn Đặt Hàng"
//                 labelIcon={<BagIcon />}
//                 onClick={() => router.push("/my-orders")}
//               />
//             </UserButton.MenuItems>
//           </UserButton>
//         ) : (
//           <button
//             onClick={openSignIn}
//             className="flex items-center gap-2 hover:text-gray-900 transition"
//           >
//             <Image src={assets.user_icon} alt="user icon" />
//             Account
//           </button>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
"use client";
import React, { useState, useEffect } from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import MegaMenu from "./MegaMenu";

const Navbar = () => {
  const { isSeller, router, user } = useAppContext();
  const { openSignIn } = useClerk();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [categories, setCategories] = useState([]);

  const isValidQuery = (query) => {
    return /[a-zA-Z0-9]/.test(query);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categorys/mega-menu");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          console.log("Fetched categories:", data.categories);
          setCategories(data.categories);
        } else {
          console.error("API error:", data.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error.message);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setNoResults(false);

      if (searchQuery.trim() && isValidQuery(searchQuery)) {
        fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("Search API Response:", data);
            if (!data.success || !data.products || data.products.length === 0) {
              setSuggestions([]);
              setNoResults(true);
            } else {
              setSuggestions(data.products.slice(0, 5));
            }
          })
          .catch((err) => {
            console.error("Error fetching suggestions:", err);
            setSuggestions([]);
            setNoResults(true);
          });
      } else {
        setSuggestions([]);
        if (searchQuery.trim()) {
          setNoResults(true);
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setNoResults(false);
    }
  };

  return (
    <nav className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      <div className="flex items-center justify-between w-full md:w-auto mb-2 md:mb-0">
        <Image
          className="cursor-pointer w-28 md:w-32"
          onClick={() => router.push("/")}
          src={assets.logo}
          alt="logo"
        />
        <div className="md:hidden">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Danh Mục</NavigationMenuTrigger>
                <NavigationMenuContent className="w-full mt-2">
                  <MegaMenu categories={categories} />
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden w-full md:w-auto justify-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Danh Mục</NavigationMenuTrigger>
              <NavigationMenuContent className="w-full mt-2">
                <MegaMenu categories={categories} />
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Link href="/" className="hover:text-gray-900 transition">
          Trang Chủ
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Shop
        </Link>
        <Link href="/about-us" className="hover:text-gray-900 transition">
          About Us
        </Link>
        <Link
          href="https://www.facebook.com/techtrend.62980/"
          className="hover:text-gray-900 transition"
          target="_blank"
          rel="noopener noreferrer"
        >
          Liên Hệ
        </Link>
        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border px-4 py-1.5 rounded-full"
          >
            Admin Dashboard
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
        <div className="relative w-full md:w-auto">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 w-full"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-full"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Image
                  className="w-4 h-4"
                  src={assets.search_icon}
                  alt="search icon"
                />
              </button>
            </div>
          </form>
          {suggestions.length > 0 && (
            <ul className="absolute top-10 left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
              {suggestions.map((item) => (
                <li key={item._id} className="px-3 py-2 hover:bg-gray-100">
                  <Link
                    href={`/product/${item._id}`}
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                      setNoResults(false);
                    }}
                    className="flex items-center gap-3"
                  >
                    <Image
                      src={
                        item.image?.[0] ||
                        item.images?.[0] ||
                        assets.placeholder_image
                      }
                      alt={item.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover rounded"
                      onError={(e) => (e.target.src = assets.placeholder_image)}
                    />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {noResults && (
            <div className="absolute top-10 left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 px-3 py-2 text-gray-500">
              Không tìm thấy sản phẩm
            </div>
          )}
        </div>

        {user ? (
          <UserButton
            appearance={{
              elements: {
                userButtonFooter: { display: "none" },
                menuFooter: { display: "none" },
                userButtonPopoverFooter: { display: "none" },
                branding: { display: "none" },
                clerkBranding: { display: "none" },
                footerBrandingLogo: { display: "none" },
                clerkFooter: { display: "none" },
                userButtonBranding: { display: "none" },
              },
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Action
                label="Giỏ Hàng"
                labelIcon={<CartIcon />}
                onClick={() => router.push("/cart")}
              />
              <UserButton.Action
                label="Đơn Đặt Hàng"
                labelIcon={<BagIcon />}
                onClick={() => router.push("/my-orders")}
              />
            </UserButton.MenuItems>
          </UserButton>
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Image src={assets.user_icon} alt="user icon" />
            Account
          </button>
        )}
      </div>

      <div className="flex items-center md:hidden gap-3 w-full">
        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border px-4 py-1.5 rounded-full"
          >
            Admin Dashboard
          </button>
        )}
        <div className="relative w-full">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 w-full"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-full"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Image
                  className="w-4 h-4"
                  src={assets.search_icon}
                  alt="search icon"
                />
              </button>
            </div>
          </form>
          {suggestions.length > 0 && (
            <ul className="absolute top-10 right-0 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
              {suggestions.map((item) => (
                <li key={item._id} className="px-3 py-2 hover:bg-gray-100">
                  <Link
                    href={`/product/${item._id}`}
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                      setNoResults(false);
                    }}
                    className="flex items-center gap-3"
                  >
                    <Image
                      src={
                        item.image?.[0] ||
                        item.images?.[0] ||
                        assets.placeholder_image
                      }
                      alt={item.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover rounded"
                      onError={(e) => (e.target.src = assets.placeholder_image)}
                    />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {noResults && (
            <div className="absolute top-10 right-0 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 px-3 py-2 text-gray-500">
              Không tìm thấy sản phẩm
            </div>
          )}
        </div>
        {user ? (
          <UserButton
            appearance={{
              elements: {
                userButtonFooter: { display: "none" },
                menuFooter: { display: "none" },
                userButtonPopoverFooter: { display: "none" },
                branding: { display: "none" },
                clerkBranding: { display: "none" },
                footerBrandingLogo: { display: "none" },
                clerkFooter: { display: "none" },
                userButtonBranding: { display: "none" },
              },
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Action
                label="Home"
                labelIcon={<HomeIcon />}
                onClick={() => router.push("/")}
              />
              <UserButton.Action
                label="Sản Phẩm"
                labelIcon={<BoxIcon />}
                onClick={() => router.push("/all-products")}
              />
              <UserButton.Action
                label="Giỏ Hàng"
                labelIcon={<CartIcon />}
                onClick={() => router.push("/cart")}
              />
              <UserButton.Action
                label="Đơn Đặt Hàng"
                labelIcon={<BagIcon />}
                onClick={() => router.push("/my-orders")}
              />
            </UserButton.MenuItems>
          </UserButton>
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Image src={assets.user_icon} alt="user icon" />
            Account
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
