import { NextResponse } from "next/server";

export async function GET() {
  // Cart is managed client-side via zustand
  // This endpoint can sync server-side carts when user logs in
  return NextResponse.json({ items: [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // TODO: Sync cart items to DB for logged-in users
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}
