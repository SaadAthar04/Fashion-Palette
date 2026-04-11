import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, parseInt(id)),
    with: { user: true, items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Non-admin users can only see their own orders
  const role = (session.user as { role?: string }).role;
  const userId = parseInt((session.user as { id: string }).id);
  if (role !== "admin" && order.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber;
  if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus;
  if (body.notes !== undefined) updateData.notes = body.notes;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  await db.update(orders).set(updateData).where(eq(orders.id, parseInt(id)));

  const updated = await db.query.orders.findFirst({
    where: eq(orders.id, parseInt(id)),
    with: { user: true, items: true },
  });

  return NextResponse.json(updated);
}
