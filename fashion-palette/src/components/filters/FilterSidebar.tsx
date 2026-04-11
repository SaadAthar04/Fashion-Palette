"use client";

import { X } from "lucide-react";
import { PRODUCT_FABRICS, PRODUCT_SIZES, PRODUCT_OCCASIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import PriceRange from "./PriceRange";
import type { Brand } from "@/types";

interface FilterSidebarProps {
  brands: Brand[];
  selectedBrands: string[];
  selectedSizes: string[];
  selectedFabrics: string[];
  selectedOccasions: string[];
  minPrice: string;
  maxPrice: string;
  onToggleBrand: (slug: string) => void;
  onToggleSize: (size: string) => void;
  onToggleFabric: (fabric: string) => void;
  onToggleOccasion: (occasion: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onClearAll: () => void;
  className?: string;
}

export default function FilterSidebar({
  brands,
  selectedBrands,
  selectedSizes,
  selectedFabrics,
  selectedOccasions,
  minPrice,
  maxPrice,
  onToggleBrand,
  onToggleSize,
  onToggleFabric,
  onToggleOccasion,
  onPriceChange,
  onClearAll,
  className,
}: FilterSidebarProps) {
  const hasFilters =
    selectedBrands.length > 0 ||
    selectedSizes.length > 0 ||
    selectedFabrics.length > 0 ||
    selectedOccasions.length > 0 ||
    minPrice ||
    maxPrice;

  return (
    <aside className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brands">
          {brands.map((brand) => (
            <FilterCheckbox
              key={brand.slug}
              label={brand.name}
              checked={selectedBrands.includes(brand.slug)}
              onChange={() => onToggleBrand(brand.slug)}
            />
          ))}
        </FilterSection>
      )}

      {/* Price Range */}
      <PriceRange
        minPrice={minPrice}
        maxPrice={maxPrice}
        onChange={onPriceChange}
      />

      {/* Sizes */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {PRODUCT_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => onToggleSize(size)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors",
                selectedSizes.includes(size)
                  ? "bg-primary text-white border-primary"
                  : "border-border hover:border-primary"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Fabric */}
      <FilterSection title="Fabric">
        {PRODUCT_FABRICS.map((fabric) => (
          <FilterCheckbox
            key={fabric}
            label={fabric}
            checked={selectedFabrics.includes(fabric)}
            onChange={() => onToggleFabric(fabric)}
          />
        ))}
      </FilterSection>

      {/* Occasion */}
      <FilterSection title="Occasion">
        {PRODUCT_OCCASIONS.map((occasion) => (
          <FilterCheckbox
            key={occasion}
            label={occasion}
            checked={selectedOccasions.includes(occasion)}
            onChange={() => onToggleOccasion(occasion)}
          />
        ))}
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-4">
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20"
      />
      <span className="text-sm group-hover:text-accent transition-colors">{label}</span>
    </label>
  );
}
