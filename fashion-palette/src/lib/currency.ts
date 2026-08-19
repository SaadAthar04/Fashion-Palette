// Final feedback B2: multi-currency DISPLAY only. PKR is the sole stored base
// price; foreign values are estimates derived from a cached exchange rate. Never
// double-convert — every conversion starts from the PKR base amount.

export type CurrencyCode = "PKR" | "USD" | "EUR" | "GBP" | "AUD" | "CAD";

export interface CurrencyDef {
  code: CurrencyCode;
  symbol: string;
  flag: string; // emoji
  label: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyDef> = {
  PKR: { code: "PKR", symbol: "Rs", flag: "🇵🇰", label: "Pakistani Rupee", decimals: 0 },
  USD: { code: "USD", symbol: "$", flag: "🇺🇸", label: "US Dollar", decimals: 2 },
  EUR: { code: "EUR", symbol: "€", flag: "🇪🇺", label: "Euro", decimals: 2 },
  GBP: { code: "GBP", symbol: "£", flag: "🇬🇧", label: "British Pound", decimals: 2 },
  AUD: { code: "AUD", symbol: "A$", flag: "🇦🇺", label: "Australian Dollar", decimals: 2 },
  CAD: { code: "CAD", symbol: "C$", flag: "🇨🇦", label: "Canadian Dollar", decimals: 2 },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];
// Foreign currencies the site can display estimates for (all except the base).
export const FOREIGN_CODES = CURRENCY_CODES.filter((c) => c !== "PKR");

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === "string" && v in CURRENCIES;
}

// rates: units of the target currency per 1 PKR (base = PKR). Returns null when a
// rate is unavailable so callers can fall back to PKR rather than guessing.
export function convertFromPkr(amountPkr: number, code: CurrencyCode, rates: Partial<Record<CurrencyCode, number>>): number | null {
  if (code === "PKR") return amountPkr;
  const rate = rates[code];
  if (!rate || !Number.isFinite(rate) || rate <= 0) return null;
  return amountPkr * rate;
}

// Formats an amount already in the given currency using its rounding rule.
export function formatCurrency(amount: number, code: CurrencyCode): string {
  const def = CURRENCIES[code];
  const rounded = amount.toLocaleString("en-US", {
    minimumFractionDigits: def.decimals,
    maximumFractionDigits: def.decimals,
  });
  return `${def.code} ${rounded}`;
}
