import "server-only";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory, products, productVariants, users, auditLog } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendEmail, ADMIN_NOTIFY } from "@/lib/email/mailer";
import { orderStatusEmail, adminOrderCancelledEmail } from "@/lib/email/templates";

export type CancelVia = "customer" | "guest" | "staff";

export interface CancelResult {
  ok: boolean;
  status: number; // HTTP-style status for the caller
  alreadyCancelled?: boolean;
  error?: string;
}

// Final feedback B6/B7: cancel an order ONLY while it is still "pending" (before
// admin acceptance). Idempotent and safe on double-click. Releases reserved
// stock, records a timeline entry + audit, notifies the admin, and emails the
// customer a cancellation confirmation. Used by both the account and guest paths.
export async function cancelOrderIfPending(
  orderId: number,
  opts: { actorUserId?: number | null; reason?: string | null; via: CancelVia }
): Promise<CancelResult> {
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order) return { ok: false, status: 404, error: "Order not found" };

  // Idempotent: a second click (already cancelled) is a success, not an error.
  if (order.status === "cancelled") return { ok: true, status: 200, alreadyCancelled: true };

  if (order.status !== "pending") {
    return {
      ok: false,
      status: 409,
      error:
        "This order can no longer be cancelled because it has already been accepted and is being processed. For a faulty, wrong, or misdescribed item, please contact support@fashionpalette.pk.",
    };
  }

  const reason = opts.reason?.slice(0, 300) || null;

  await db.transaction(async (tx) => {
    // Guard again inside the transaction to avoid a double-cancel race.
    const [fresh] = await tx.select({ status: orders.status }).from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!fresh || fresh.status !== "pending") return;

    await tx.update(orders).set({ status: "cancelled" }).where(eq(orders.id, orderId));
    await tx.insert(orderStatusHistory).values({
      orderId,
      status: "cancelled",
      changedByUserId: opts.actorUserId ?? null,
      note: reason ? `Cancelled by ${opts.via}: ${reason}` : `Cancelled by ${opts.via} (before acceptance)`,
    });

    // Release the stock this order had reserved.
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

    await tx.insert(auditLog).values({
      actorUserId: opts.actorUserId ?? null,
      action: `order.cancel_by_${opts.via}`,
      entityType: "order",
      entityId: String(orderId),
      meta: { from: order.status, reason },
    });
  });

  // Customer cancellation-confirmation email (never blocks).
  let email = order.guestEmail;
  let name = (order.shippingAddressJson as { fullName?: string } | null)?.fullName;
  if (!email && order.userId) {
    const [u] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, order.userId)).limit(1);
    email = u?.email ?? null;
    name = name ?? u?.name;
  }
  if (email) {
    const mail = orderStatusEmail(order.orderNumber, "cancelled", name ?? undefined);
    await sendEmail({ to: email, template: "order_cancelled", subject: mail.subject, html: mail.html, relatedOrderId: orderId });
  }

  // Admin notification.
  if (ADMIN_NOTIFY) {
    const mail = adminOrderCancelledEmail(order.orderNumber, order.total, name ?? undefined, opts.via);
    await sendEmail({ to: ADMIN_NOTIFY, template: "admin_order_cancelled", subject: mail.subject, html: mail.html, relatedOrderId: orderId });
  }

  return { ok: true, status: 200 };
}
