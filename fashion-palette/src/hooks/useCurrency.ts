"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrencyCode } from "@/lib/currency";

// Final feedback B2: remembers the customer's chosen display currency across
// visits (localStorage). PKR is the default and the only stored base price.
type CurrencyStore = {
  code: CurrencyCode;
  setCode: (code: CurrencyCode) => void;
};

export const useCurrency = create<CurrencyStore>()(
  persist(
    (set) => ({
      code: "PKR",
      setCode: (code) => set({ code }),
    }),
    { name: "fp-currency" }
  )
);
