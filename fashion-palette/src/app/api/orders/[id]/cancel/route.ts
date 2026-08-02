import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory, products, productVariants, auditLog, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendEmail } from "@/lib/email/mailer";
import { orderStatusEmail } from "@/lib/email/templates";

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

  // Cancellation window closes at acceptance (Feedback 04).
  if (order.status !== "pending") {
    return NextResponse.json(
      {
        error:
          "This order can no longer be cancelled because it has already been accepted and is being processed. For a faulty, wrong, or misdescribed item, please contact support@fashionpalette.pk.",
      },
      { status: 409 }
    );
  }

  const reason = (await request.json().catch(() => ({})))?.reason as string | undefined;

  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: "cancelled" }).where(eq(orders.id, orderId));
    await tx.insert(orderStatusHistory).values({
      orderId,
      status: "cancelled",
      changedByUserId: isStaff ? userId : order.userId,
      note: reason ? `Cancelled by customer: ${reason}` : "Cancelled by customer (before acceptance)",
    });
    // Restore the stock this order had decremented.
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
      actorUserId: userId,
      action: "order.cancel_by_customer",
      entityType: "order",
      entityId: String(orderId),
      meta: { from: order.status, reason: reason ?? null },
    });
  });

  // Confirmation email (never blocks the response).
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

  return NextResponse.json({ ok: true, status: "cancelled" });
}
