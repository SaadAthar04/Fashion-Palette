import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { FREE_DELIVERY_THRESHOLD, DEFAULT_DELIVERY_CHARGES } from "@/lib/constants";

// Feedback 24: owner-editable business rules. Defaults mirror constants.ts so
// the store works before anything is customised.
export const SETTING_DEFAULTS = {
  delivery_charge: String(DEFAULT_DELIVERY_CHARGES),
  free_delivery_threshold: String(FREE_DELIVERY_THRESHOLD),
  low_stock_threshold: "3",
  active_payment_methods: "cod", // comma-separated
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;

export async function getSettings(): Promise<Record<SettingKey, string>> {
  const rows = await db.select().from(siteSettings);
  const map: Record<string, string> = { ...SETTING_DEFAULTS };
  for (const r of rows) {
    if (r.key in SETTING_DEFAULTS) map[r.key] = r.value;
  }
  return map as Record<SettingKey, string>;
}

export async function getDeliveryConfig(): Promise<{ deliveryCharge: number; freeThreshold: number }> {
  const s = await getSettings();
  const deliveryCharge = Number(s.delivery_charge);
  const freeThreshold = Number(s.free_delivery_threshold);
  return {
    deliveryCharge: Number.isFinite(deliveryCharge) ? deliveryCharge : DEFAULT_DELIVERY_CHARGES,
    freeThreshold: Number.isFinite(freeThreshold) ? freeThreshold : FREE_DELIVERY_THRESHOLD,
  };
}
