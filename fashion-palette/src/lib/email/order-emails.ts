import "server-only";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "./mailer";
import { orderReceivedEmail, orderAcceptedEmail, orderShippedEmail, type OrderEmailData } from "./templates";
import { guestOrderUrl } from "@/lib/guest-token";
import { courierLabel } from "@/lib/courier";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";

// Final feedback B7: the three order emails (received / accepted / shipped) are
// always built from the STORED order + items, so totals match the order even if
// live product prices later change. Centralised here so order-create, the admin
// status transition, and the admin "resend" action all produce identical emails.
export type OrderEmailKind = "received" | "accepted" | "shipped";

const TEMPLATE_KEY: Record<OrderEmailKind, string> = {
  received: "order_received",
  accepted: "order_accepted",
  shipped: "order_shipped",
};

export async function buildOrderEmailData(orderId: number): Promise<{ to: string | null; data: OrderEmailData } | null> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true },
  });
  if (!order) return null;

  const addr = order.shippingAddressJson as OrderEmailData["shippingAddress"];
  let to = order.guestEmail;
  let name = addr?.fullName;
  if (!to && order.userId) {
    const [u] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, order.userId)).limit(1);
    to = u?.email ?? null;
    name = name ?? u?.name;
  }

  const data: OrderEmailData = {
    orderNumber: order.orderNumber,
    customerName: name ?? undefined,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    deliveryCharges: order.deliveryCharges,
    discountAmount: order.discountAmount,
    total: order.total,
    items: order.items.map((i) => ({
      productName: i.productName,
      productImage: i.productImage,
      articleCode: i.articleCode,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
    })),
    shippingAddress: addr,
    actionUrl: guestOrderUrl(order.id, SITE),
    courierLabel: courierLabel(order.courier),
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
  };
  return { to, data };
}

function render(kind: OrderEmailKind, data: OrderEmailData) {
  if (kind === "received") return orderReceivedEmail(data);
  if (kind === "accepted") return orderAcceptedEmail(data);
  return orderShippedEmail(data);
}

// Sends the given order email. Returns false (never throws) if there is no
// recipient or SMTP is unavailable, so it can be awaited from request handlers.
export async function sendOrderEmail(orderId: number, kind: OrderEmailKind): Promise<boolean> {
  const loaded = await buildOrderEmailData(orderId);
  if (!loaded?.to) return false;
  const mail = render(kind, loaded.data);
  return sendEmail({ to: loaded.to, template: TEMPLATE_KEY[kind], subject: mail.subject, html: mail.html, relatedOrderId: orderId });
}

// Admin preview (returns the HTML without sending).
export async function previewOrderEmail(orderId: number, kind: OrderEmailKind): Promise<{ subject: string; html: string } | null> {
  const loaded = await buildOrderEmailData(orderId);
  if (!loaded) return null;
  return render(kind, loaded.data);
}
