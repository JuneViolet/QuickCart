"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

const ProductImageGallery = ({
  productName,
  mainImage,
  setMainImage,
  selectedVariant,
  productImages,
}) => {
  const imageContainerRef = useRef(null);

  const scrollLeft = () => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollBy({ left: -100, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollBy({ left: 100, behavior: "smooth" });
    }
  };

  const allImages = selectedVariant?.images || productImages || [];

  return (
    <div className="px-5 lg:px-16 xl:px-20">
      <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4 aspect-[4/4]">
        <Image
          src={
            mainImage ||
            selectedVariant?.images?.[0] ||
            productImages?.[0] ||
            assets.placeholder_image
          }
          alt={productName}
          className="w-full h-full object-cover mix-blend-multiply"
          width={1280}
          height={720}
        />
      </div>
      <div className="relative">
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 opacity-50 text-white p-1.5 rounded-full z-10 text-sm hover:opacity-75"
        >
          ←
        </button>
        <div
          ref={imageContainerRef}
          className="grid grid-cols-4 gap-2 pb-4"
          style={{ scrollBehavior: "smooth" }}
        >
          {allImages
            .reduce((unique, image) => {
              return unique.includes(image) ? unique : [...unique, image];
            }, [])
            .slice(0, 4)
            .map((image, index) => (
              <div
                key={index}
                onClick={() => setMainImage(image)}
                className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 aspect-[4/4] min-w-[70px]"
              >
                <Image
                  src={image}
                  alt={productName}
                  className="w-full h-full object-cover mix-blend-multiply"
                  width={1280}
                  height={720}
                />
              </div>
            ))}
          {allImages.length > 4 && (
            <div
              className="col-span-4 overflow-x-auto flex gap-2 mt-2"
              style={{ scrollBehavior: "smooth" }}
            >
              {allImages
                .reduce((unique, image) => {
                  return unique.includes(image) ? unique : [...unique, image];
                }, [])
                .slice(4)
                .map((image, index) => (
                  <div
                    key={`extra-${index}`}
                    onClick={() => setMainImage(image)}
                    className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 aspect-[4/4] min-w-[70px]"
                  >
                    <Image
                      src={image}
                      alt={productName}
                      className="w-full h-full object-cover mix-blend-multiply"
                      width={1280}
                      height={720}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 opacity-50 text-white p-1.5 rounded-full z-10 text-sm hover:opacity-75"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default ProductImageGallery;
