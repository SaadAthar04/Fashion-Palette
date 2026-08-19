import { NextResponse } from "next/server";
import { getRates } from "@/lib/rates";

// Public: current exchange rates (base PKR) for display-only conversion (B2).
// Cached server-side; the client fetches this once and converts locally.
export async function GET() {
  const payload = await getRates();
  return NextResponse.json(payload, {
    headers: {
      // Allow CDN/browser to cache briefly; the source of truth refreshes daily.
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
