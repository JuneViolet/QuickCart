"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

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

  // Xử lý lightbox
  const openLightbox = (image) => {
    setLightboxImage(image);
    setIsLightboxOpen(true);
    const allImages = selectedVariant?.images || productImages || [];
    const index = allImages.findIndex((img) => img === image);
    setCurrentImageIndex(index !== -1 ? index : 0);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxImage("");
  };

  const nextImage = () => {
    const allImages = selectedVariant?.images || productImages || [];
    const nextIndex = (currentImageIndex + 1) % allImages.length;
    setCurrentImageIndex(nextIndex);
    setLightboxImage(allImages[nextIndex]);
    setMainImage(allImages[nextIndex]);
  };

  const prevImage = () => {
    const allImages = selectedVariant?.images || productImages || [];
    const prevIndex =
      currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    setLightboxImage(allImages[prevIndex]);
    setMainImage(allImages[prevIndex]);
  };

  // Xử lý zoom
  const handleMouseMove = (e) => {
    if (!isZoomed || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  // Xử lý keyboard cho lightbox
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isLightboxOpen) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isLightboxOpen, currentImageIndex]);

  const allImages = selectedVariant?.images || productImages || [];
  const currentMainImage =
    mainImage ||
    selectedVariant?.images?.[0] ||
    productImages?.[0] ||
    assets.placeholder_image;

  return (
    <>
      <div className="px-5 lg:px-16 xl:px-20">
        {/* Hình ảnh chính - Kích thước khớp với 4 thumbnail bên dưới, tỷ lệ 1:1 */}
        <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4 relative cursor-pointer group">
          <div
            ref={imageRef}
            className="relative w-full h-0 pb-[100%] overflow-hidden" // 1:1 aspect ratio (square)
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => openLightbox(currentMainImage)}
          >
            <Image
              src={currentMainImage}
              alt={productName}
              className={`absolute inset-0 w-full h-full object-contain mix-blend-multiply transition-transform duration-300 ${
                isZoomed ? "scale-150" : "scale-100"
              }`}
              width={1280}
              height={1280}
              style={{
                objectFit: "contain",
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            />

            {/* Zoom indicator */}
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              🔍 Click để xem lớn
            </div>

            {/* Navigation arrows on main image */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  →
                </button>
              </>
            )}
          </div>
        </div>

        {/* Thumbnails - Improved responsive design */}
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
                  className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 relative transition-all duration-200 ${
                    currentMainImage === image
                      ? "ring-2 ring-blue-500 transform scale-105"
                      : "hover:scale-105"
                  }`}
                >
                  <div className="w-full h-0 pb-[100%] relative">
                    {" "}
                    {/* 1:1 aspect ratio (square) */}
                    <Image
                      src={image}
                      alt={`${productName} thumbnail ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-contain mix-blend-multiply hover:object-cover transition-all duration-300"
                      width={300}
                      height={300}
                    />
                  </div>
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
                      className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 relative transition-all duration-200 min-w-[70px] ${
                        currentMainImage === image
                          ? "ring-2 ring-blue-500 transform scale-105"
                          : "hover:scale-105"
                      }`}
                    >
                      <div className="w-full h-0 pb-[100%] relative">
                        {" "}
                        {/* 1:1 aspect ratio (square) */}
                        <Image
                          src={image}
                          alt={`${productName} thumbnail ${index + 5}`}
                          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply hover:object-cover transition-all duration-300"
                          width={300}
                          height={300}
                        />
                      </div>
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

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors z-10"
            >
              ✕
            </button>

            {/* Previous button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
              >
                ←
              </button>
            )}

            {/* Next button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
              >
                →
              </button>
            )}

            {/* Main lightbox image */}
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImage}
                alt={productName}
                className="max-w-full max-h-full object-contain"
                width={1920}
                height={1920}
                style={{ objectFit: "contain" }}
              />

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </div>

            {/* Keyboard hints */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs p-2 rounded">
              <div>← → : Chuyển ảnh</div>
              <div>ESC : Đóng</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductImageGallery;
