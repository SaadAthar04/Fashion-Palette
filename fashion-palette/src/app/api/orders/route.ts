import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  orderStatusHistory,
  products,
  productVariants,
  productImages,
  users,
  coupons,
} from "@/lib/db/schema";
import { eq, and, or, like, desc, count, inArray, sql, gte, lte } from "drizzle-orm";
import { checkoutSchema } from "@/lib/validators";
import { generateOrderNumber } from "@/lib/utils";
import { getDeliveryConfig } from "@/lib/settings";
import { sendEmail } from "@/lib/email/mailer";
import { orderReceivedEmail, adminNewOrderEmail, adminLowStockEmail } from "@/lib/email/templates";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const STAFF_ROLES = ["admin", "order_manager"];

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("q")?.trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const format = searchParams.get("format");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const role = (session.user as { role?: string }).role ?? "customer";
  const userId = parseInt((session.user as { id: string }).id);
  const isStaff = STAFF_ROLES.includes(role);

  const conditions = [];
  if (!isStaff) conditions.push(eq(orders.userId, userId));
  if (status && status !== "all") {
    conditions.push(eq(orders.status, status as typeof orders.status.enumValues[number]));
  }
  // Feedback 19: date-range filter.
  if (from) conditions.push(gte(orders.createdAt, new Date(from)));
  if (to) conditions.push(lte(orders.createdAt, new Date(`${to}T23:59:59`)));

  // Feedback 19: staff can search by order number, customer, phone, payment ref.
  if (search) {
    const term = `%${search}%`;
    const searchConds = [
      like(orders.orderNumber, term),
      like(orders.paymentReference, term),
      like(orders.guestEmail, term),
      like(orders.guestPhone, term),
    ];
    if (isStaff) {
      const matchedUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(or(like(users.name, term), like(users.email, term), like(users.phone, term)));
      if (matchedUsers.length) {
        searchConds.push(inArray(orders.userId, matchedUsers.map((u) => u.id)));
      }
    }
    conditions.push(or(...searchConds)!);
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Feedback 19: CSV export of the current (filtered) result set, staff only.
  if (isStaff && format === "csv") {
    const rows = await db.query.orders.findMany({
      where,
      with: { user: true, items: true },
      orderBy: () => [desc(orders.createdAt)],
    });
    const cell = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["Order", "Customer", "Email", "Phone", "Items", "Subtotal", "Delivery", "Total", "Payment", "Payment Status", "Status", "Date"];
    const lines = rows.map((o) => {
      const addr = o.shippingAddressJson as { fullName?: string; phone?: string } | null;
      return [
        o.orderNumber,
        o.user?.name || addr?.fullName || "Guest",
        o.user?.email || o.guestEmail || "",
        addr?.phone || o.guestPhone || "",
        o.items.length,
        o.subtotal,
        o.deliveryCharges,
        o.total,
        o.paymentMethod,
        o.paymentStatus,
        o.status,
        new Date(o.createdAt).toISOString(),
      ].map(cell).join(",");
    });
    const csv = [header.join(","), ...lines].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const [items, [{ total }]] = await Promise.all([
    db.query.orders.findMany({
      where,
      with: { user: true, items: true },
      orderBy: () => [desc(orders.createdAt)],
      limit,
      offset,
    }),
    db.select({ total: count() }).from(orders).where(where),
  ]);

  return NextResponse.json({
    orders: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

type IncomingItem = { productId: number; variantId?: number | null; quantity: number };

export async function POST(request: Request) {
  // Feedback 27: rate-limit checkout submissions per IP.
  if (!rateLimit(`checkout:${clientIp(request)}`, 20, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    const session = await getServerSession(authOptions);
    const userId = session?.user ? parseInt((session.user as { id: string }).id) : null;

    const incoming: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
    if (!incoming.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // ── Server-side revalidation (Feedback 14/27): never trust browser prices ──
    const productIds = [...new Set(incoming.map((i) => Number(i.productId)))];
    const dbProducts = await db.query.products.findMany({
      where: and(
        inArray(products.id, productIds),
        eq(products.isActive, true),
        eq(products.publishStatus, "published")
      ),
      with: { variants: true, images: true, brand: true },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    const issues: string[] = [];
    const validated: {
      productId: number;
      variantId: number | null;
      productName: string;
      productImage: string;
      brand: string | null;
      size: string | null;
      color: string | null;
      quantity: number;
      unitPrice: number;
    }[] = [];

    for (const item of incoming) {
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 0));
      const p = productMap.get(Number(item.productId));
      if (!p) {
        issues.push("An item is no longer available and was removed.");
        continue;
      }
      const variant = item.variantId ? p.variants.find((v) => v.id === Number(item.variantId)) ?? null : null;
      if (item.variantId && !variant) {
        issues.push(`A selected option for "${p.name}" is unavailable.`);
        continue;
      }

      // Stock (Feedback 14: out-of-stock handling)
      const available = variant ? variant.stockQuantity : p.stockQuantity;
      if (available < qty) {
        issues.push(`"${p.name}" has only ${available} in stock.`);
        continue;
      }

      // Authoritative price from DB
      const base = parseFloat(p.salePrice || p.basePrice);
      const adj = variant ? parseFloat(variant.priceAdjustment) : 0;
      const unitPrice = base + adj;

      const primary = p.images.find((im) => im.isPrimary) ?? p.images[0];
      validated.push({
        productId: p.id,
        variantId: variant?.id ?? null,
        productName: p.name,
        productImage: primary?.imageUrl ?? "",
        brand: p.brand?.name ?? null,
        size: variant?.size ?? null,
        color: variant?.color ?? null,
        quantity: qty,
        unitPrice,
      });
    }

    if (!validated.length) {
      return NextResponse.json(
        { error: "None of the items could be ordered.", issues },
        { status: 409 }
      );
    }
    if (issues.length) {
      // Some items failed — ask the client to review before charging (Feedback 14).
      return NextResponse.json(
        { error: "Your cart needs attention before checkout.", issues },
        { status: 409 }
      );
    }

    const subtotal = validated.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

    // ── Coupon (optional, server-validated) ──
    let discount = 0;
    let couponId: number | null = null;
    let couponCode: string | null = null;
    if (data.couponCode) {
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(and(eq(coupons.code, data.couponCode), eq(coupons.isActive, true)))
        .limit(1);
      const now = new Date();
      const valid =
        coupon &&
        (!coupon.startsAt || coupon.startsAt <= now) &&
        (!coupon.endsAt || coupon.endsAt >= now) &&
        subtotal >= parseFloat(coupon.minSubtotal) &&
        (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit);
      if (!valid) {
        return NextResponse.json({ error: "This coupon is not valid for your order." }, { status: 409 });
      }
      discount =
        coupon.discountType === "percent"
          ? Math.round((subtotal * parseFloat(coupon.discountValue)) / 100)
          : parseFloat(coupon.discountValue);
      discount = Math.min(discount, subtotal);
      couponId = coupon.id;
      couponCode = coupon.code;
    }

    // Feedback 16/24: flat delivery, free above threshold — read from settings
    // so the owner can change it; server stays authoritative.
    const netSubtotal = subtotal - discount;
    const { deliveryCharge, freeThreshold } = await getDeliveryConfig();
    const deliveryCharges = netSubtotal >= freeThreshold ? 0 : deliveryCharge;
    const total = netSubtotal + deliveryCharges;
    const orderNumber = generateOrderNumber();

    // ── Persist atomically (Feedback 19: also record initial status + decrement stock) ──
    const orderId = await db.transaction(async (tx) => {
      const [result] = await tx
        .insert(orders)
        .values({
          userId,
          orderNumber,
          status: "pending",
          subtotal: subtotal.toFixed(2),
          deliveryCharges: deliveryCharges.toFixed(2),
          discountAmount: discount.toFixed(2),
          couponId,
          couponCode,
          total: total.toFixed(2),
          paymentMethod: data.paymentMethod,
          paymentStatus: "pending",
          shippingAddressJson: data.shippingAddress,
          guestEmail: userId ? null : data.email,
          guestPhone: userId ? null : data.shippingAddress.phone,
          notes: data.notes || null,
        })
        .$returningId();
      const newOrderId = result.id;

      await tx.insert(orderItems).values(
        validated.map((i) => ({
          orderId: newOrderId,
          productId: i.productId,
          variantId: i.variantId,
          productName: i.productName,
          productImage: i.productImage,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          unitPrice: i.unitPrice.toFixed(2),
          totalPrice: (i.unitPrice * i.quantity).toFixed(2),
        }))
      );

      // Decrement stock at order placement (Feedback 19).
      for (const i of validated) {
        if (i.variantId) {
          await tx
            .update(productVariants)
            .set({ stockQuantity: sql`GREATEST(${productVariants.stockQuantity} - ${i.quantity}, 0)` })
            .where(eq(productVariants.id, i.variantId));
        }
        await tx
          .update(products)
          .set({ stockQuantity: sql`GREATEST(${products.stockQuantity} - ${i.quantity}, 0)` })
          .where(eq(products.id, i.productId));
      }

      await tx.insert(orderStatusHistory).values({
        orderId: newOrderId,
        status: "pending",
        changedByUserId: userId,
        note: "Order placed",
      });

      if (couponId) {
        await tx
          .update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(eq(coupons.id, couponId));
      }

      return newOrderId;
    });

    // Feedback 20: order-received email (never blocks/fails the order).
    const customerEmail = userId
      ? (await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1))[0]?.email
      : data.email;
    if (customerEmail) {
      const mail = orderReceivedEmail({
        orderNumber,
        total: total.toFixed(2),
        paymentMethod: data.paymentMethod,
        customerName: data.shippingAddress.fullName,
        items: validated.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          size: i.size,
          totalPrice: (i.unitPrice * i.quantity).toFixed(2),
        })),
      });
      await sendEmail({ to: customerEmail, template: "order_received", subject: mail.subject, html: mail.html, relatedOrderId: orderId });
    }

    // Feedback 20: admin new-order notification.
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_REPLY_TO;
    if (adminEmail) {
      const adminMail = adminNewOrderEmail(orderNumber, total.toFixed(2), data.shippingAddress.fullName);
      await sendEmail({ to: adminEmail, template: "admin_new_order", subject: adminMail.subject, html: adminMail.html, relatedOrderId: orderId });

      // Feedback 12/31: low-stock alert for products that just fell to/below threshold.
      try {
        const orderedIds = [...new Set(validated.map((i) => i.productId))];
        if (orderedIds.length) {
          const low = await db
            .select({ name: products.name, sku: products.sku, stock: products.stockQuantity })
            .from(products)
            .where(and(inArray(products.id, orderedIds), sql`${products.stockQuantity} <= ${products.lowStockThreshold}`));
          if (low.length) {
            const mail = adminLowStockEmail(low);
            await sendEmail({ to: adminEmail, template: "admin_low_stock", subject: mail.subject, html: mail.html });
          }
        }
      } catch { /* alerting must never break checkout */ }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      total: total.toFixed(2),
      message: "Order placed successfully!",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
