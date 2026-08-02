import { NextResponse } from "next/server";
import { getDeliveryConfig } from "@/lib/settings";

// Public delivery config so the cart/checkout show the same charge the server
// will actually apply (server remains authoritative at order time).
export async function GET() {
  const { deliveryCharge, freeThreshold } = await getDeliveryConfig();
  return NextResponse.json(
    { deliveryCharge, freeThreshold },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } }
  );
}
