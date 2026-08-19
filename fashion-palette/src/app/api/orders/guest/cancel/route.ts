import { NextResponse } from "next/server";
import { verifyOrderToken } from "@/lib/guest-token";
import { cancelOrderIfPending } from "@/lib/orders";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Final feedback B6: a guest cancels via the signed token from their email —
// never by logging in or by exposing the public order number. Rate-limited and
// idempotent (safe if the customer clicks twice).
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`guest-cancel:${ip}`, 10, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const token = body?.token as string | undefined;
  const orderId = verifyOrderToken(token);
  if (!orderId) {
    return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 403 });
  }

  // Per-order rate limit as well, so one token can't be hammered.
  if (!rateLimit(`guest-cancel-order:${orderId}`, 10, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }

  const reason = typeof body?.reason === "string" ? body.reason : undefined;
  const result = await cancelOrderIfPending(orderId, { actorUserId: null, reason, via: "guest" });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true, status: "cancelled", alreadyCancelled: !!result.alreadyCancelled });
}
