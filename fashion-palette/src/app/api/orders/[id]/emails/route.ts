import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";
import { previewOrderEmail, sendOrderEmail, type OrderEmailKind } from "@/lib/email/order-emails";

const KINDS: OrderEmailKind[] = ["received", "accepted", "shipped"];

function parseKind(v: string | null): OrderEmailKind | null {
  return v && (KINDS as string[]).includes(v) ? (v as OrderEmailKind) : null;
}

// Admin preview (Final feedback B7): returns the rendered email HTML.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  const kind = parseKind(new URL(request.url).searchParams.get("kind"));
  if (!kind) return NextResponse.json({ error: "Unknown email kind" }, { status: 400 });

  const preview = await previewOrderEmail(parseInt(id), kind);
  if (!preview) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(preview);
}

// Admin resend (Final feedback B7): re-sends an event email; the send is recorded
// in the email log, and the resend action is audited.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  const orderId = parseInt(id);
  const body = await request.json().catch(() => ({}));
  const kind = parseKind(body?.kind);
  if (!kind) return NextResponse.json({ error: "Unknown email kind" }, { status: 400 });

  const sent = await sendOrderEmail(orderId, kind);

  const session = await getServerSession(authOptions);
  const staffId = session?.user ? parseInt((session.user as { id: string }).id) : null;
  await db.insert(auditLog).values({
    actorUserId: staffId,
    action: "order.email_resend",
    entityType: "order",
    entityId: String(orderId),
    meta: { kind, sent },
  });

  if (!sent) {
    return NextResponse.json({ error: "Email could not be sent (no recipient or SMTP unavailable). Check the email log." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
