"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderSummary from "@/components/OrderSummary";

const CheckoutPage = () => {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-16">
        <h1 className="text-2xl md:text-3xl font-medium text-gray-500">
          Thanh Toán
        </h1>
        <OrderSummary />
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
