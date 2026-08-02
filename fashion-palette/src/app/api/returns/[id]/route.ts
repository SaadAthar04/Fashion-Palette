import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { returns, orders, orderItems, orderStatusHistory, products, productVariants, auditLog, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { requireRole } from "@/lib/admin";
import { sendEmail } from "@/lib/email/mailer";
import { returnStatusEmail } from "@/lib/email/templates";

const STAFF_ROLES = ["admin", "order_manager"];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(STAFF_ROLES);
  if (auth.error) return auth.error;
  const { id } = await params;
  const row = await db.query.returns.findFirst({
    where: eq(returns.id, parseInt(id)),
    with: { order: true, user: true, handledBy: true },
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

const patchSchema = z.object({
  status: z.enum(["requested", "approved", "rejected", "item_received", "inspected", "replacement_sent", "refunded", "closed"]).optional(),
  inspectionResult: z.string().max(2000).optional(),
  returnAuthorization: z.string().max(100).optional(),
  courier: z.string().max(100).optional(),
  trackingNumber: z.string().max(100).optional(),
  refundAmount: z.union([z.string(), z.number()]).optional(),
  refundMethod: z.string().max(60).optional(),
  refundReference: z.string().max(120).optional(),
  staffNotes: z.string().max(2000).optional(),
  note: z.string().max(500).optional(), // for status-change reason
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(STAFF_ROLES);
  if (auth.error) return auth.error;
  const staffId = parseInt(auth.session.user.id);

  const { id } = await params;
  const returnId = parseInt(id);
  const current = await db.query.returns.findFirst({ where: eq(returns.id, returnId) });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let data: z.infer<typeof patchSchema>;
  try {
    data = patchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  // Feedback 22: a status/refund reason is required for rejection & refund.
  if ((data.status === "rejected" || data.status === "refunded") && !data.note && !data.staffNotes && !data.refundReference) {
    return NextResponse.json({ error: "Please add a note/reason for a rejection or refund." }, { status: 400 });
  }

  const movingToRefunded = data.status === "refunded" && current.status !== "refunded";
  if (movingToRefunded && current.refundedAt) {
    return NextResponse.json({ error: "This return has already been refunded — duplicate refunds are blocked." }, { status: 409 });
  }

  const update: Record<string, unknown> = { handledByUserId: staffId };
  if (data.status !== undefined) update.status = data.status;
  if (data.inspectionResult !== undefined) update.inspectionResult = data.inspectionResult;
  if (data.returnAuthorization !== undefined) update.returnAuthorization = data.returnAuthorization;
  if (data.courier !== undefined) update.courier = data.courier;
  if (data.trackingNumber !== undefined) update.trackingNumber = data.trackingNumber;
  if (data.refundAmount !== undefined) update.refundAmount = String(data.refundAmount);
  if (data.refundMethod !== undefined) update.refundMethod = data.refundMethod;
  if (data.refundReference !== undefined) update.refundReference = data.refundReference;
  if (data.staffNotes !== undefined) update.staffNotes = data.staffNotes;
  if (movingToRefunded) update.refundedAt = new Date();

  await db.transaction(async (tx) => {
    await tx.update(returns).set(update).where(eq(returns.id, returnId));

    // Keep the order's status in step with the return outcome + restore stock
    // on a completed refund/return (Feedback 21/22).
    if (data.status === "refunded" || data.status === "item_received") {
      const orderStatus = data.status === "refunded" ? "refunded" : "returned";
      await tx.update(orders).set({ status: orderStatus }).where(eq(orders.id, current.orderId));
      await tx.insert(orderStatusHistory).values({
        orderId: current.orderId,
        status: orderStatus,
        changedByUserId: staffId,
        note: data.note || `Return ${data.status}`,
      });
      if (movingToRefunded) {
        const lines = await tx.select().from(orderItems).where(eq(orderItems.orderId, current.orderId));
        for (const line of lines) {
          if (line.variantId) {
            await tx.update(productVariants).set({ stockQuantity: sql`${productVariants.stockQuantity} + ${line.quantity}` }).where(eq(productVariants.id, line.variantId));
          }
          await tx.update(products).set({ stockQuantity: sql`${products.stockQuantity} + ${line.quantity}` }).where(eq(products.id, line.productId));
        }
      }
    }

    await tx.insert(auditLog).values({
      actorUserId: staffId,
      action: "return.update",
      entityType: "return",
      entityId: String(returnId),
      meta: { from: current.status, to: data.status ?? current.status, refunded: movingToRefunded },
    });
  });

  // Feedback 31: notify the customer on meaningful return status changes.
  const NOTIFY = ["approved", "rejected", "item_received", "inspected", "replacement_sent", "refunded"];
  if (data.status && data.status !== current.status && NOTIFY.includes(data.status)) {
    const order = await db.query.orders.findFirst({ where: eq(orders.id, current.orderId) });
    let email = order?.guestEmail ?? null;
    let name = (order?.shippingAddressJson as { fullName?: string } | null)?.fullName;
    if (!email && order?.userId) {
      const [u] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, order.userId)).limit(1);
      email = u?.email ?? null;
      name = name ?? u?.name;
    }
    if (email && order) {
      const mail = returnStatusEmail(order.orderNumber, data.status, name ?? undefined);
      await sendEmail({ to: email, template: `return_${data.status}`, subject: mail.subject, html: mail.html, relatedOrderId: order.id });
    }
  }

  return NextResponse.json({ ok: true });
}
