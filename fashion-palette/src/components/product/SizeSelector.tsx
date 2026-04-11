"use client";

import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types";

interface SizeSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

export default function SizeSelector({
  variants,
  selectedVariant,
  onSelect,
}: SizeSelectorProps) {
  // Filter variants that have a size defined
  const sizeVariants = variants.filter((v) => v.size);

  if (sizeVariants.length === 0) return null;

  // Get unique sizes, preserving order
  const uniqueSizes = Array.from(
    new Map(sizeVariants.map((v) => [v.size, v])).values()
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold uppercase tracking-wider">
          Size
        </label>
        {selectedVariant?.size && (
          <span className="text-sm text-muted">
            Selected: <span className="font-medium text-primary">{selectedVariant.size}</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {uniqueSizes.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stockQuantity <= 0;

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelect(variant)}
              disabled={isOutOfStock}
              className={cn(
                "relative min-w-[48px] h-12 px-4 text-sm font-medium rounded-lg border-2 transition-all duration-200",
                isSelected
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-white text-primary hover:border-accent",
                isOutOfStock &&
                  "opacity-40 cursor-not-allowed border-border bg-surface text-muted line-through hover:border-border"
              )}
              aria-label={`Size ${variant.size}${isOutOfStock ? " - Out of stock" : ""}`}
            >
              {variant.size}
              {isOutOfStock && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-full h-px bg-muted rotate-[-20deg] absolute" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Size guide link */}
      <button className="text-xs text-accent hover:text-accent-hover underline underline-offset-4 transition-colors">
        View Size Guide
      </button>
    </div>
  );
}
