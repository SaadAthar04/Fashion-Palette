"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import Drawer from "@/components/ui/Drawer";
import FilterSidebar from "./FilterSidebar";
import type { Brand } from "@/types";

interface MobileFiltersProps {
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
}

export default function MobileFilters(props: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
      </button>

      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Filters" side="left">
        <div className="p-6">
          <FilterSidebar {...props} />
        </div>
      </Drawer>
    </>
  );
}
