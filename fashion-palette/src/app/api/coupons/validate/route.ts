import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";

// Phase 2 B2: customer-facing coupon preview for checkout. Returns the discount
// (in PKR) a code would apply to the given subtotal, or a reason it can't. The
// authoritative re-check still happens when the order is placed.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code : "";
  const subtotal = Number(body.subtotal);
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return NextResponse.json({ valid: false, reason: "Add items to your cart first." }, { status: 400 });
  }

  const result = await validateCoupon(code, subtotal);
  if (!result.valid) {
    return NextResponse.json({ valid: false, reason: result.reason });
  }
  return NextResponse.json({ valid: true, code: result.code, discount: result.discount });
}
