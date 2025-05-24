// components/SideBanner.jsx
import React from "react";

const SideBanner = ({ position }) => {
  return (
    <div className="hidden lg:flex w-24 flex-col items-center justify-center">
      <div className="bg-orange-100 p-2 text-center rounded shadow-md">
        <p>{position === "left" ? "Khuyến mãi trái" : "Ưu đãi phải"}</p>
      </div>
    </div>
  );
};

export default SideBanner;
