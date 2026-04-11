"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import type { ProductImage as ProductImageType } from "@/types";

interface ProductImagesProps {
  images: ProductImageType[];
  productName: string;
}

export default function ProductImages({
  images,
  productName,
}: ProductImagesProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const currentImage = sortedImages[selectedIndex] || sortedImages[0];

  const handlePrev = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? sortedImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === sortedImages.length - 1 ? 0 : prev + 1
    );
  };

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-[3/4] bg-surface flex items-center justify-center">
        <p className="text-muted text-sm">No image available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3">
      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[640px] scrollbar-hide">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative w-16 h-20 md:w-[72px] md:h-[88px] flex-shrink-0 overflow-hidden transition-all duration-300",
                index === selectedIndex
                  ? "ring-1 ring-accent ring-offset-1 opacity-100"
                  : "opacity-40 hover:opacity-70"
              )}
            >
              <Image
                src={getImageUrl(image.imageUrl)}
                alt={image.altText || `${productName} - ${index + 1}`}
                fill
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative flex-1 group">
        <div
          className={cn(
            "relative aspect-[3/4] bg-surface overflow-hidden cursor-crosshair",
            isZoomed && "cursor-zoom-out"
          )}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <Image
            src={getImageUrl(currentImage.imageUrl)}
            alt={currentImage.altText || productName}
            fill
            className={cn(
              "object-cover transition-transform duration-500 ease-out",
              isZoomed && "scale-150"
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />

          {/* Zoom icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
            aria-label="Toggle zoom"
          >
            <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </>
        )}

        {/* Image Counter (mobile) */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/60 text-white text-[10px] tracking-wider px-3 py-1.5 backdrop-blur-sm md:hidden">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>
    </div>
  );
}
