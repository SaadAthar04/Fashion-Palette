import { createHmac, timingSafeEqual } from "crypto";

// Final feedback B1: one-click unsubscribe. A signed token over the email (no
// expiry — unsubscribe links must keep working) so no extra DB column is needed
// and the link can't be forged.
const SECRET = process.env.GUEST_ORDER_SECRET || process.env.NEXTAUTH_SECRET || "";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(`newsletter:${value}`).digest("base64url");
}

export function signUnsubscribeToken(email: string): string {
  const e = Buffer.from(email.toLowerCase()).toString("base64url");
  return `${e}.${sign(email.toLowerCase())}`;
}

export function verifyUnsubscribeToken(token: string | undefined | null): string | null {
  if (!token || !SECRET) return null;
  const [ePart, sig] = token.split(".");
  if (!ePart || !sig) return null;
  let email: string;
  try {
    email = Buffer.from(ePart, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = sign(email);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return email;
}

export function unsubscribeUrl(email: string): string {
  return `${SITE.replace(/\/$/, "")}/newsletter/unsubscribe/${signUnsubscribeToken(email)}`;
}
