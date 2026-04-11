"use client";

import { useState, useEffect } from "react";

interface PriceRangeProps {
  minPrice: string;
  maxPrice: string;
  onChange: (min: string, max: string) => void;
}

export default function PriceRange({
  minPrice,
  maxPrice,
  onChange,
}: PriceRangeProps) {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  useEffect(() => {
    setMin(minPrice);
  }, [minPrice]);
  useEffect(() => {
    setMax(maxPrice);
  }, [maxPrice]);

  const handleApply = () => {
    onChange(min, max);
  };

  return (
    <div className="border-t border-border/30 pt-5">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4">
        Price Range
      </h4>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          placeholder="Min"
          className="w-full px-3 py-2.5 border border-border/50 text-[13px] focus:outline-none focus:border-accent transition-colors duration-300"
        />
        <span className="text-muted/40">&mdash;</span>
        <input
          type="number"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          placeholder="Max"
          className="w-full px-3 py-2.5 border border-border/50 text-[13px] focus:outline-none focus:border-accent transition-colors duration-300"
        />
      </div>
      <button
        onClick={handleApply}
        className="w-full mt-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300"
      >
        Apply
      </button>
    </div>
  );
}
