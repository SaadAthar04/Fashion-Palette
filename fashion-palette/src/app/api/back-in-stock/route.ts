import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { backInStockSubscriptions, products, brands } from "@/lib/db/schema";
import { and, eq, desc, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { notifyBackInStock } from "@/lib/back-in-stock";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^0?3\d{9}$|^\+?\d{10,15}$/;

// Public: subscribe to a back-in-stock alert (B5). At least one of email /
// whatsapp is required; the other is optional. Duplicate pending requests for the
// same product+variant+contact are ignored.
export async function POST(request: NextRequest) {
  if (!rateLimit(`bis:${clientIp(request)}`, 15, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  const productId = parseInt(body?.productId);
  const variantId = body?.variantId ? parseInt(body.variantId) : null;
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  const whatsapp = typeof body?.whatsapp === "string" ? body.whatsapp.trim() : "";

  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }
  if (!email && !whatsapp) {
    return NextResponse.json({ error: "Enter an email or a WhatsApp number so we can notify you." }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (whatsapp && !PHONE_RE.test(whatsapp.replace(/[\s-]/g, ""))) {
    return NextResponse.json({ error: "Enter a valid WhatsApp number." }, { status: 400 });
  }

  // Prevent an accidental duplicate pending subscription (same product/variant/contact).
  const dup = await db
    .select({ id: backInStockSubscriptions.id })
    .from(backInStockSubscriptions)
    .where(
      and(
        eq(backInStockSubscriptions.productId, productId),
        variantId ? eq(backInStockSubscriptions.variantId, variantId) : eq(backInStockSubscriptions.status, "pending"),
        eq(backInStockSubscriptions.status, "pending"),
        email ? eq(backInStockSubscriptions.email, email) : eq(backInStockSubscriptions.whatsapp, whatsapp)
      )
    )
    .limit(1);
  if (dup.length) {
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  }

  await db.insert(backInStockSubscriptions).values({
    productId,
    variantId,
    email: email || null,
    whatsapp: whatsapp || null,
  });

  return NextResponse.json({ ok: true });
}

// Admin: list requests with product info + status counts.
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const rows = await db
    .select({
      id: backInStockSubscriptions.id,
      productId: backInStockSubscriptions.productId,
      email: backInStockSubscriptions.email,
      whatsapp: backInStockSubscriptions.whatsapp,
      status: backInStockSubscriptions.status,
      notifiedAt: backInStockSubscriptions.notifiedAt,
      errorMessage: backInStockSubscriptions.errorMessage,
      createdAt: backInStockSubscriptions.createdAt,
      productName: products.name,
      brand: brands.name,
      stock: products.stockQuantity,
    })
    .from(backInStockSubscriptions)
    .leftJoin(products, eq(backInStockSubscriptions.productId, products.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .orderBy(desc(backInStockSubscriptions.createdAt))
    .limit(500);

  const counts = await db
    .select({ status: backInStockSubscriptions.status, c: count() })
    .from(backInStockSubscriptions)
    .groupBy(backInStockSubscriptions.status);

  return NextResponse.json({ rows, counts });
}

// Admin: resend a failed alert, or cancel (opt-out) a request.
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const id = parseInt(body?.id);
  const action = body?.action;
  if (!Number.isFinite(id) || !["resend", "cancel"].includes(action)) {
    return NextResponse.json({ error: "id and a valid action are required" }, { status: 400 });
  }

  if (action === "cancel") {
    await db.update(backInStockSubscriptions).set({ status: "cancelled" }).where(eq(backInStockSubscriptions.id, id));
    return NextResponse.json({ ok: true });
  }

  // Resend: reset to pending then re-run notify for that product.
  const [sub] = await db.select().from(backInStockSubscriptions).where(eq(backInStockSubscriptions.id, id)).limit(1);
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.update(backInStockSubscriptions).set({ status: "pending", errorMessage: null }).where(eq(backInStockSubscriptions.id, id));
  const res = await notifyBackInStock(sub.productId);
  return NextResponse.json({ ok: true, ...res });
}
