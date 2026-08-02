import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { returns, orders, orderItems, orderStatusHistory, auditLog } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireRole } from "@/lib/admin";
import { sendEmail, ADMIN_NOTIFY } from "@/lib/email/mailer";
import { adminReturnRequestEmail } from "@/lib/email/templates";

const STAFF_ROLES = ["admin", "order_manager"];
const RETURN_WINDOW_MS = 48 * 60 * 60 * 1000; // Feedback 22: 48-hour reporting window

// Staff: list return requests (filter by status).
export async function GET(request: NextRequest) {
  const auth = await requireRole(STAFF_ROLES);
  if (auth.error) return auth.error;

  const status = new URL(request.url).searchParams.get("status");
  const where = status && status !== "all"
    ? eq(returns.status, status as typeof returns.status.enumValues[number])
    : undefined;

  const rows = await db.query.returns.findMany({
    where,
    with: { order: true, user: true },
    orderBy: () => [desc(returns.createdAt)],
  });
  return NextResponse.json({ returns: rows });
}

// Customer: request a return / report an issue on a delivered order.
const createSchema = z.object({
  orderId: z.number().int(),
  reason: z.string().min(5).max(2000),
  evidenceUrls: z.array(z.string().url()).max(8).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = parseInt((session.user as { id: string }).id);

  let data: z.infer<typeof createSchema>;
  try {
    data = createSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Please describe the issue (min 5 characters)." }, { status: 400 });
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, data.orderId),
    with: { items: true, statusHistory: { orderBy: [desc(orderStatusHistory.createdAt)] } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (order.status !== "delivered") {
    return NextResponse.json(
      { error: "You can report an issue only after the order is delivered. For anything else, contact support@fashionpalette.pk." },
      { status: 409 }
    );
  }

  // 48-hour window from the delivered timestamp (Feedback 22).
  const deliveredAt = order.statusHistory.find((h) => h.status === "delivered")?.createdAt ?? order.updatedAt;
  if (deliveredAt && Date.now() - new Date(deliveredAt).getTime() > RETURN_WINDOW_MS) {
    return NextResponse.json(
      { error: "The 48-hour reporting window for this order has passed. Please contact support@fashionpalette.pk — statutory rights still apply." },
      { status: 409 }
    );
  }

  // Prevent duplicate open requests.
  const existing = await db.query.returns.findFirst({
    where: and(eq(returns.orderId, order.id)),
  });
  if (existing && !["rejected", "closed", "refunded"].includes(existing.status)) {
    return NextResponse.json({ error: "A return request for this order is already in progress." }, { status: 409 });
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  const [res] = await db
    .insert(returns)
    .values({
      orderId: order.id,
      userId,
      reason: data.reason,
      evidenceUrls: data.evidenceUrls ?? [],
      itemsJson: items.map((i) => ({ name: i.productName, quantity: i.quantity })),
      status: "requested",
    })
    .$returningId();

  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: "return_requested" }).where(eq(orders.id, order.id));
    await tx.insert(orderStatusHistory).values({
      orderId: order.id,
      status: "return_requested",
      changedByUserId: userId,
      note: "Return requested by customer",
    });
    await tx.insert(auditLog).values({
      actorUserId: userId,
      action: "return.create",
      entityType: "return",
      entityId: String(res.id),
      meta: { orderNumber: order.orderNumber },
    });
  });

  // Notify staff (never blocks).
  const adminMail = adminReturnRequestEmail(order.orderNumber, data.reason);
  await sendEmail({ to: ADMIN_NOTIFY, template: "admin_return_request", subject: adminMail.subject, html: adminMail.html, relatedOrderId: order.id });

  return NextResponse.json({ ok: true, id: res.id });
}
