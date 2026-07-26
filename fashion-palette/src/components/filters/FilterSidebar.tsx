"use client";

import { X } from "lucide-react";
import { PRODUCT_FABRICS, PRODUCT_SIZES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import PriceRange from "./PriceRange";
import type { Brand } from "@/types";

// Fashion filter options (Feedback 12)
const STITCH_OPTIONS = [
  { value: "unstitched", label: "Unstitched" },
  { value: "stitched", label: "Stitched" },
];
const WORK_OPTIONS = [
  { value: "print", label: "Print" },
  { value: "embroidered", label: "Embroidered" },
];
const PIECE_OPTIONS = [
  { value: "1-piece", label: "1 Piece" },
  { value: "2-piece", label: "2 Piece" },
  { value: "3-piece", label: "3 Piece" },
];

// Shared filter props used by both the desktop sidebar and the mobile drawer.
export interface FilterProps {
  brands: Brand[];
  selectedBrands: string[];
  selectedSizes: string[];
  selectedFabrics: string[];
  selectedStitch: string[];
  selectedWork: string[];
  selectedPieces: string[];
  saleOnly: boolean;
  minPrice: string;
  maxPrice: string;
  onToggleBrand: (slug: string) => void;
  onToggleSize: (size: string) => void;
  onToggleFabric: (fabric: string) => void;
  onToggleStitch: (v: string) => void;
  onToggleWork: (v: string) => void;
  onTogglePieces: (v: string) => void;
  onToggleSale: () => void;
  onPriceChange: (min: string, max: string) => void;
  onClearAll: () => void;
}

export default function FilterSidebar({
  brands,
  selectedBrands,
  selectedSizes,
  selectedFabrics,
  selectedStitch,
  selectedWork,
  selectedPieces,
  saleOnly,
  minPrice,
  maxPrice,
  onToggleBrand,
  onToggleSize,
  onToggleFabric,
  onToggleStitch,
  onToggleWork,
  onTogglePieces,
  onToggleSale,
  onPriceChange,
  onClearAll,
  className,
}: FilterProps & { className?: string }) {
  const hasFilters =
    selectedBrands.length > 0 ||
    selectedSizes.length > 0 ||
    selectedFabrics.length > 0 ||
    selectedStitch.length > 0 ||
    selectedWork.length > 0 ||
    selectedPieces.length > 0 ||
    saleOnly ||
    !!minPrice ||
    !!maxPrice;

  return (
    <aside className={cn("space-y-6", className)}>
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

      {/* Sale */}
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={saleOnly}
          onChange={onToggleSale}
          className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20"
        />
        <span className="text-sm font-medium group-hover:text-accent transition-colors">On Sale</span>
      </label>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brand">
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

      {/* Stitch type */}
      <FilterSection title="Stitch">
        {STITCH_OPTIONS.map((o) => (
          <FilterCheckbox
            key={o.value}
            label={o.label}
            checked={selectedStitch.includes(o.value)}
            onChange={() => onToggleStitch(o.value)}
          />
        ))}
      </FilterSection>

      {/* Work */}
      <FilterSection title="Work">
        {WORK_OPTIONS.map((o) => (
          <FilterCheckbox
            key={o.value}
            label={o.label}
            checked={selectedWork.includes(o.value)}
            onChange={() => onToggleWork(o.value)}
          />
        ))}
      </FilterSection>

      {/* Piece count */}
      <FilterSection title="Pieces">
        {PIECE_OPTIONS.map((o) => (
          <FilterCheckbox
            key={o.value}
            label={o.label}
            checked={selectedPieces.includes(o.value)}
            onChange={() => onTogglePieces(o.value)}
          />
        ))}
      </FilterSection>

      {/* Price Range */}
      <PriceRange minPrice={minPrice} maxPrice={maxPrice} onChange={onPriceChange} />

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
                  ? "bg-accent text-white border-accent"
                  : "border-border hover:border-accent"
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
