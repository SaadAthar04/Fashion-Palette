import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";

// Phase 2 B2: single source of truth for coupon validation + discount maths, so
// the checkout preview and the order-placement endpoint always agree (a banner
// must never advertise a code checkout can't honour).
export type CouponResult =
  | { valid: true; couponId: number; code: string; discount: number; discountType: string; discountValue: string }
  | { valid: false; reason: string };

export async function validateCoupon(rawCode: string | null | undefined, subtotal: number): Promise<CouponResult> {
  const code = (rawCode ?? "").trim();
  if (!code) return { valid: false, reason: "No code provided." };

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.code, code), eq(coupons.isActive, true)))
    .limit(1);

  if (!coupon) return { valid: false, reason: "This code is not valid." };

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { valid: false, reason: "This code isn't active yet." };
  if (coupon.endsAt && coupon.endsAt < now) return { valid: false, reason: "This code has expired." };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, reason: "This code has reached its usage limit." };
  }
  const minSubtotal = parseFloat(coupon.minSubtotal);
  if (subtotal < minSubtotal) {
    return { valid: false, reason: `Minimum spend of Rs. ${minSubtotal.toLocaleString("en-PK")} required.` };
  }

  let discount =
    coupon.discountType === "percent"
      ? Math.round((subtotal * parseFloat(coupon.discountValue)) / 100)
      : parseFloat(coupon.discountValue);
  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    discount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  };
}
