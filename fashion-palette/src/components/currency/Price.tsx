"use client";

import { useEffect, useState } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { useRates } from "@/hooks/useRates";
import { convertFromPkr, formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

// Final feedback B2: renders a PKR base amount in the customer's selected display
// currency. Always PKR on the server + first client render (no hydration
// mismatch); foreign values are clearly labelled estimates and are converted
// straight from the PKR base (never double-converted). Falls back to PKR if no
// rate is available.
export default function Price({
  pkr,
  className,
  estClassName,
  showEst = true,
  foreignOnly = false,
}: {
  pkr: number | string;
  className?: string;
  estClassName?: string;
  showEst?: boolean;
  // When true, renders nothing while PKR is selected (used at checkout, where the
  // PKR total is authoritative and the foreign estimate is shown underneath).
  foreignOnly?: boolean;
}) {
  const amount = typeof pkr === "string" ? parseFloat(pkr) : pkr;
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const { code } = useCurrency();
  const { data } = useRates();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || code === "PKR" || !data) {
    if (foreignOnly) return null;
    return <span className={className}>{formatCurrency(safeAmount, "PKR")}</span>;
  }

  const converted = convertFromPkr(safeAmount, code, data.rates);
  if (converted == null) {
    if (foreignOnly) return null;
    return <span className={className}>{formatCurrency(safeAmount, "PKR")}</span>;
  }

  return (
    <span className={className}>
      ≈ {formatCurrency(converted, code)}
      {showEst && <span className={cn("ml-1 text-[0.75em] opacity-70 font-normal", estClassName)}>est.</span>}
    </span>
  );
}
