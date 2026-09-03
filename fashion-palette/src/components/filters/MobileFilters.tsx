"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import Drawer from "@/components/ui/Drawer";
import FilterSidebar, { type FilterProps } from "./FilterSidebar";

// Phase 2 A4: mobile filter drawer with explicit Apply (View results) and Clear
// controls. Filters apply live as they are toggled; "View results" simply closes
// the drawer so the customer can see the updated grid.
export default function MobileFilters(props: FilterProps & { resultCount?: number }) {
  const { resultCount, ...filterProps } = props;
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
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <FilterSidebar {...filterProps} />
          </div>
          <div className="flex items-center gap-3 border-t border-border p-4">
            <button
              onClick={() => {
                filterProps.onClearAll();
              }}
              className="flex-1 py-3 border border-primary text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-surface transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 py-3 bg-primary text-white text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-primary/90 transition-colors"
            >
              {typeof resultCount === "number" ? `View ${resultCount} result${resultCount === 1 ? "" : "s"}` : "Apply"}
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
