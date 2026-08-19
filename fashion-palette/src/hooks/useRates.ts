"use client";

import { useQuery } from "@tanstack/react-query";
import type { CurrencyCode } from "@/lib/currency";

export interface RatesResponse {
  base: "PKR";
  rates: Partial<Record<CurrencyCode, number>>;
  provider: string;
  fetchedAt: string | null;
  lastSuccessAt: string | null;
  stale: boolean;
}

// Fetches the cached, server-side exchange rates once and shares them across all
// <Price> components (react-query dedupes by key). Rates refresh daily server-side.
export function useRates() {
  return useQuery<RatesResponse>({
    queryKey: ["currency-rates"],
    queryFn: async () => {
      const res = await fetch("/api/currency/rates");
      if (!res.ok) throw new Error("rates unavailable");
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
