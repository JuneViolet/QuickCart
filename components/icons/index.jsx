// components/icons/index.js
import React from "react";

export const Icons = {
  logo: (props) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  // Thêm các icon khác nếu cần (VD: search, menu, v.v.)
  search: (props) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <line
        x1="21"
        y1="21"
        x2="15.8"
        y2="15.8"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),
};

export default Icons;
