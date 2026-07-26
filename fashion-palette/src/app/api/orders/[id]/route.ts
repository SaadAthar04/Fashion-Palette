import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory, products, productVariants, auditLog, users } from "@/lib/db/schema";
import { eq, sql, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/email/mailer";
import { orderStatusEmail } from "@/lib/email/templates";

// Statuses that warrant a customer email (Feedback 20).
const NOTIFY_STATUSES = ["confirmed", "processing", "shipped", "delivered", "cancelled", "return_requested", "returned", "refunded"];

// Statuses whose entry means the stock should be returned (Feedback 19).
const STOCK_RESTORE_STATUSES = ["cancelled", "returned", "refunded"];

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
    with: {
      user: true,
      items: true,
      statusHistory: { orderBy: [asc(orderStatusHistory.createdAt)] },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Non-staff users can only see their own orders.
  const role = (session.user as { role?: string }).role ?? "customer";
  const userId = parseInt((session.user as { id: string }).id);
  if (!["admin", "order_manager"].includes(role) && order.userId !== userId) {
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

  const session = await getServerSession(authOptions);
  const staffId = session?.user ? parseInt((session.user as { id: string }).id) : null;

  const { id } = await params;
  const orderId = parseInt(id);
  const body = await request.json();

  const current = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber;
  if (body.courier !== undefined) updateData.courier = body.courier;
  if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus;
  if (body.paymentReference !== undefined) updateData.paymentReference = body.paymentReference;
  if (body.notes !== undefined) updateData.notes = body.notes;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const statusChanged = !!body.status && body.status !== current.status;
  const shouldRestoreStock =
    statusChanged &&
    STOCK_RESTORE_STATUSES.includes(body.status) &&
    !STOCK_RESTORE_STATUSES.includes(current.status);

  await db.transaction(async (tx) => {
    await tx.update(orders).set(updateData).where(eq(orders.id, orderId));

    if (statusChanged) {
      // Feedback 19: record who changed the status, when, and an optional note.
      await tx.insert(orderStatusHistory).values({
        orderId,
        status: body.status,
        changedByUserId: staffId,
        note: body.note || null,
      });
    }

    if (shouldRestoreStock) {
      const lines = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      for (const line of lines) {
        if (line.variantId) {
          await tx
            .update(productVariants)
            .set({ stockQuantity: sql`${productVariants.stockQuantity} + ${line.quantity}` })
            .where(eq(productVariants.id, line.variantId));
        }
        await tx
          .update(products)
          .set({ stockQuantity: sql`${products.stockQuantity} + ${line.quantity}` })
          .where(eq(products.id, line.productId));
      }
    }

    // Feedback 22/28: audit important order changes.
    await tx.insert(auditLog).values({
      actorUserId: staffId,
      action: statusChanged ? "order.status_change" : "order.update",
      entityType: "order",
      entityId: String(orderId),
      meta: { from: current.status, to: body.status ?? current.status, restoredStock: shouldRestoreStock },
    });
  });

  // Feedback 20: notify the customer on meaningful status changes (never blocks).
  if (statusChanged && NOTIFY_STATUSES.includes(body.status)) {
    let email = current.guestEmail;
    let name = (current.shippingAddressJson as { fullName?: string } | null)?.fullName;
    if (!email && current.userId) {
      const [u] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, current.userId)).limit(1);
      email = u?.email ?? null;
      name = name ?? u?.name;
    }
    if (email) {
      const mail = orderStatusEmail(current.orderNumber, body.status, name ?? undefined, body.courier, body.trackingNumber);
      await sendEmail({ to: email, template: `order_${body.status}`, subject: mail.subject, html: mail.html, relatedOrderId: orderId });
    }
  }

  const updated = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      user: true,
      items: true,
      statusHistory: { orderBy: [asc(orderStatusHistory.createdAt)] },
    },
  });

  return NextResponse.json(updated);
}
