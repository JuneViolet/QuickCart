// "use client";
// import React from "react";
// import HeaderSlider from "@/components/HeaderSlider";
// import HomeProducts from "@/components/HomeProducts";
// import Banner from "@/components/Banner";
// import NewsLetter from "@/components/NewsLetter";
// import FeaturedProduct from "@/components/FeaturedProduct";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import SideBanner from "@/components/SideBanner";
// const Home = () => {
//   return (
//     <>
//       <Navbar />
//       <div className="px-6 md:px-16 lg:px-32">
//         <HeaderSlider />
//         <HomeProducts />
//         <FeaturedProduct />
//         <Banner />
//         <NewsLetter />
//       </div>
//       <Footer />
//     </>
//   );
// };
// // const Home = () => {
// //   return (
// //     <>
// //       <Navbar />
// //       <div className="flex">
// //         {/* Banner bên trái */}
// //         <SideBanner position="left" />

// //         {/* Nội dung chính */}
// //         <div className="flex-1 px-6 md:px-16 lg:px-32">
// //           <HeaderSlider />
// //           <HomeProducts />
// //           <FeaturedProduct />
// //           <Banner />
// //           <NewsLetter />
// //         </div>

// //         {/* Banner bên phải */}
// //         <SideBanner position="right" />
// //       </div>
// //       <Footer />
// //     </>
// //   );
// // };
// export default Home;
"use client";

import React from "react";
import { Suspense } from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideBanner from "@/components/SideBanner";

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider />
        <Suspense fallback={<div>Đang tải sản phẩm...</div>}>
          <HomeProducts />
        </Suspense>
        <FeaturedProduct />
        <Banner />
        {/* <NewsLetter /> */}
      </div>
      <Footer />
    </>
  );
};

export default Home;
