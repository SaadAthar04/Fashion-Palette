import "server-only";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { FOREIGN_CODES, type CurrencyCode } from "@/lib/currency";

// Final feedback B2: fetch exchange rates SERVER-SIDE from one approved provider,
// refresh at least daily and cache them (in site_settings) so every page uses the
// same rate. On failure, use the last cached rate; if none exists, fall back to
// PKR only. No AI, no scraping.

const CACHE_KEY = "exchange_rates";
const REFRESH_MS = 24 * 60 * 60 * 1000; // refresh at least daily
// Base = PKR. open.er-api.com is free and key-less; override with a keyed
// provider via EXCHANGE_RATE_URL if desired (must return { rates: { USD: ... } }).
const PROVIDER_URL = process.env.EXCHANGE_RATE_URL || "https://open.er-api.com/v6/latest/PKR";
const PROVIDER_NAME = process.env.EXCHANGE_RATE_PROVIDER || "open.er-api.com";

export interface RatePayload {
  base: "PKR";
  rates: Partial<Record<CurrencyCode, number>>; // units of currency per 1 PKR
  provider: string;
  fetchedAt: string | null; // when we last attempted+stored
  lastSuccessAt: string | null; // last successful provider refresh
  stale: boolean; // true when served from cache after a failed refresh, or PKR-only fallback
}

async function readCache(): Promise<Omit<RatePayload, "stale"> | null> {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, CACHE_KEY)).limit(1);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

async function writeCache(payload: Omit<RatePayload, "stale">): Promise<void> {
  const value = JSON.stringify(payload);
  await db
    .insert(siteSettings)
    .values({ key: CACHE_KEY, value })
    .onDuplicateKeyUpdate({ set: { value } });
}

async function fetchFromProvider(): Promise<Partial<Record<CurrencyCode, number>> | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(PROVIDER_URL, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    const raw = json?.rates ?? json?.conversion_rates;
    if (!raw || typeof raw !== "object") return null;
    const out: Partial<Record<CurrencyCode, number>> = {};
    for (const code of FOREIGN_CODES) {
      const v = Number(raw[code]);
      if (Number.isFinite(v) && v > 0) out[code] = v;
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

export async function getRates(): Promise<RatePayload> {
  const cache = await readCache();
  const now = Date.now();
  const fresh = cache?.fetchedAt && now - Date.parse(cache.fetchedAt) < REFRESH_MS;

  if (cache && fresh) {
    return { ...cache, stale: false };
  }

  // Needs a refresh (stale cache or no cache).
  const fetched = await fetchFromProvider();
  if (fetched) {
    const nowIso = new Date(now).toISOString();
    const payload = { base: "PKR" as const, rates: fetched, provider: PROVIDER_NAME, fetchedAt: nowIso, lastSuccessAt: nowIso };
    await writeCache(payload);
    return { ...payload, stale: false };
  }

  // Provider failed — use the last cached rate with its last-updated date.
  if (cache) {
    return { ...cache, stale: true };
  }

  // No valid rate at all — fall back to PKR only rather than guessing.
  return { base: "PKR", rates: {}, provider: PROVIDER_NAME, fetchedAt: null, lastSuccessAt: null, stale: true };
}
