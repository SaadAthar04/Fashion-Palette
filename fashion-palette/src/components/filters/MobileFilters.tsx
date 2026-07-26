"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import Drawer from "@/components/ui/Drawer";
import FilterSidebar, { type FilterProps } from "./FilterSidebar";

export default function MobileFilters(props: FilterProps) {
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
