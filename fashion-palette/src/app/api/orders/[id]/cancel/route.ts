import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cancelOrderIfPending } from "@/lib/orders";

// Feedback 04: a customer may cancel ONLY before the second (acceptance) email —
// i.e. while the order is still "pending". After acceptance, fulfilment has begun.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = parseInt((session.user as { id: string }).id);
  const role = (session.user as { role?: string }).role ?? "customer";
  const isStaff = ["admin", "order_manager"].includes(role);

  const { id } = await params;
  const orderId = parseInt(id);
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (!isStaff && order.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reason = (await request.json().catch(() => ({})))?.reason as string | undefined;
  const result = await cancelOrderIfPending(orderId, {
    actorUserId: userId,
    reason,
    via: isStaff ? "staff" : "customer",
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true, status: "cancelled" });
}
