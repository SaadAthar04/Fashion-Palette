"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { CURRENCIES, CURRENCY_CODES, type CurrencyCode } from "@/lib/currency";
import { cn } from "@/lib/utils";

// Phase 2 feedback C: minimal currency selector. Each row and the collapsed
// header show ONLY the flag + three-letter code (no symbol, country code or
// full name). The estimate disclosure lives beside converted prices and in
// cart/checkout, not inside this menu. Screen readers still get the full name
// via an accessible label such as "US Dollar (USD)".
export default function CurrencySelector({ className }: { className?: string }) {
  const { code, setCode } = useCurrency();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Server + first client render show PKR so markup matches (no hydration flicker).
  const current = CURRENCIES[mounted ? code : "PKR"];

  const choose = (c: CurrencyCode) => {
    setCode(c);
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-primary/80 hover:text-accent transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Display currency: ${current.label} (${current.code})`}
      >
        <span className="text-[13px] leading-none">{current.flag}</span>
        <span className="tracking-wide">{current.code}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[132px] bg-white border border-border shadow-[0_16px_32px_-20px_rgba(0,0,0,0.3)] py-1" role="listbox">
          {CURRENCY_CODES.map((c) => {
            const def = CURRENCIES[c];
            return (
              <button
                key={c}
                role="option"
                aria-selected={c === code}
                aria-label={`${def.label} (${def.code})`}
                onClick={() => choose(c)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-left hover:bg-surface transition-colors",
                  c === code && "bg-surface/70 font-semibold"
                )}
              >
                <span className="text-[15px] leading-none">{def.flag}</span>
                <span className="font-medium tracking-wide">{def.code}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
