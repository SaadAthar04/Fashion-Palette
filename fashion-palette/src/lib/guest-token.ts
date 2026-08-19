import { createHmac, timingSafeEqual } from "crypto";

// Final feedback B6: a guest must be able to view/cancel an order WITHOUT an
// account and WITHOUT the order being exposed by its public order number alone.
// We issue a stateless, signed, expiring token: base64url(orderId).base64url(exp)
// .base64url(HMAC-SHA256(orderId.exp)). No DB column is needed — the signature is
// unforgeable and the cancellation window is enforced separately by order status.

const SECRET = process.env.GUEST_ORDER_SECRET || process.env.NEXTAUTH_SECRET || "";
const DEFAULT_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days — long enough to view from the email

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function signOrderToken(orderId: number, ttlMs: number = DEFAULT_TTL_MS): string {
  const exp = Date.now() + ttlMs;
  const payload = `${b64url(String(orderId))}.${b64url(String(exp))}`;
  return `${payload}.${sign(payload)}`;
}

// Returns the orderId if the token is well-formed, correctly signed and not
// expired; otherwise null. Uses a constant-time comparison for the signature.
export function verifyOrderToken(token: string | undefined | null): number | null {
  if (!token || !SECRET) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [idPart, expPart, sig] = parts;
  const payload = `${idPart}.${expPart}`;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let orderId: number;
  let exp: number;
  try {
    orderId = parseInt(Buffer.from(idPart, "base64url").toString("utf8"), 10);
    exp = parseInt(Buffer.from(expPart, "base64url").toString("utf8"), 10);
  } catch {
    return null;
  }
  if (!Number.isFinite(orderId) || orderId <= 0) return null;
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  return orderId;
}

// Absolute URL of the secure guest order page for use in emails/links.
export function guestOrderUrl(orderId: number, siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}/orders/${signOrderToken(orderId)}`;
}
