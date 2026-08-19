import "server-only";
import { db } from "@/lib/db";
import { backInStockSubscriptions, products } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email/mailer";
import { backInStockEmail } from "@/lib/email/templates";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";

// Final feedback B5: when a product comes back in stock, notify pending
// subscribers automatically through the available approved channel (email).
// WhatsApp-only requests stay pending for manual admin outreach (no WhatsApp
// send API). Each subscriber is notified once; stock is never described as
// reserved. Never throws — safe to call from a request handler.
export async function notifyBackInStock(productId: number): Promise<{ sent: number; failed: number; pendingWhatsApp: number }> {
  let sent = 0, failed = 0, pendingWhatsApp = 0;
  try {
    const pending = await db
      .select()
      .from(backInStockSubscriptions)
      .where(and(eq(backInStockSubscriptions.productId, productId), eq(backInStockSubscriptions.status, "pending")));
    if (!pending.length) return { sent, failed, pendingWhatsApp };

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { images: true },
    });
    if (!product) return { sent, failed, pendingWhatsApp };

    const primary = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
    const mail = backInStockEmail({
      productName: product.name,
      productImage: primary?.imageUrl ?? "",
      price: product.salePrice || product.basePrice,
      productUrl: `${SITE.replace(/\/$/, "")}/products/${product.slug}`,
    });

    for (const sub of pending) {
      if (sub.email) {
        const ok = await sendEmail({ to: sub.email, template: "back_in_stock", subject: mail.subject, html: mail.html });
        await db
          .update(backInStockSubscriptions)
          .set(ok ? { status: "notified", notifiedAt: new Date(), errorMessage: null } : { status: "failed", errorMessage: "email send failed" })
          .where(eq(backInStockSubscriptions.id, sub.id));
        if (ok) sent++; else failed++;
      } else {
        // WhatsApp-only — left pending for manual admin contact.
        pendingWhatsApp++;
      }
    }
  } catch (e) {
    console.error("notifyBackInStock error:", e instanceof Error ? e.message : e);
  }
  return { sent, failed, pendingWhatsApp };
}
