import { NextRequest } from "next/server";

// Feedback 27: rate-limit sensitive endpoints (login, reset, register, checkout,
// contact, coupon checks). In-memory sliding window — sufficient for a single
// PM2 instance; move to Redis if the app is horizontally scaled.
type Hit = { count: number; resetAt: number };
const buckets = new Map<string, Hit>();

export function clientIp(req: NextRequest | Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Returns { ok: false } when the caller has exceeded `limit` requests within
 * `windowMs`. Key should scope the action (e.g. `login:1.2.3.4`).
 */
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const hit = buckets.get(key);

  if (!hit || hit.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  hit.count += 1;
  if (hit.count > limit) {
    return { ok: false, retryAfter: Math.ceil((hit.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

// Opportunistic cleanup so the map doesn't grow unbounded.
export function sweepRateLimits() {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
}
