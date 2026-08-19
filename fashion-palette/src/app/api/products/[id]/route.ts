import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages, productVariants, auditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireCatalogueEditor } from "@/lib/admin";
import { productSchema } from "@/lib/validators";
import { revalidateCatalog } from "@/lib/revalidate";
import { productWriteError } from "../route";
import { notifyBackInStock } from "@/lib/back-in-stock";
import { sanitizeHtml } from "@/lib/sanitize-html";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await db.query.products.findFirst({
    where: eq(products.id, parseInt(id)),
    with: { brand: true, category: true, images: true, variants: true, reviews: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCatalogueEditor();
  if (auth.error) return auth.error;

  const { id } = await params;
  const productId = parseInt(id);

  try {
    const body = await request.json();
    const data = productSchema.parse(body);
    // B3: sanitize rich-text HTML before storing.
    data.description = sanitizeHtml(data.description);

    // Feedback 16: record which important fields changed (old → new).
    const before = await db.query.products.findFirst({ where: eq(products.id, productId) });
    const TRACKED = ["name", "basePrice", "salePrice", "stockQuantity", "publishStatus", "isActive", "categoryId", "brandId"] as const;
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    if (before) {
      for (const k of TRACKED) {
        const oldV = (before as Record<string, unknown>)[k];
        const newV = (data as Record<string, unknown>)[k];
        if (newV !== undefined && String(oldV) !== String(newV)) {
          changes[k] = { from: oldV, to: newV };
        }
      }
    }

    await db.update(products).set(data).where(eq(products.id, productId));
    await db.insert(auditLog).values({
      actorUserId: parseInt(auth.session.user.id),
      action: "product.update",
      entityType: "product",
      entityId: String(productId),
      meta: { changes, publishStatus: data.publishStatus },
    });

    // Update images if provided
    if (body.images) {
      await db.delete(productImages).where(eq(productImages.productId, productId));
      if (body.images.length > 0) {
        await db.insert(productImages).values(
          body.images.map((img: { imageUrl: string; altText?: string; sortOrder?: number; isPrimary?: boolean }, i: number) => ({
            productId,
            imageUrl: img.imageUrl,
            altText: img.altText || null,
            sortOrder: img.sortOrder ?? i,
            isPrimary: img.isPrimary ?? i === 0,
          }))
        );
      }
    }

    // Update variants if provided
    if (body.variants) {
      await db.delete(productVariants).where(eq(productVariants.productId, productId));
      if (body.variants.length > 0) {
        await db.insert(productVariants).values(
          body.variants.map((v: { size?: string; color?: string; colorHex?: string; stockQuantity?: number; priceAdjustment?: string; skuSuffix?: string }) => ({
            productId,
            size: v.size || null,
            color: v.color || null,
            colorHex: v.colorHex || null,
            stockQuantity: v.stockQuantity ?? 0,
            priceAdjustment: v.priceAdjustment || "0.00",
            skuSuffix: v.skuSuffix || null,
          }))
        );
      }
    }

    const updated = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { brand: true, category: true, images: true, variants: true },
    });

    // Final feedback B5: when a product transitions from out-of-stock to
    // in-stock (and is published), notify pending back-in-stock subscribers.
    const wasOut = !before || before.stockQuantity <= 0;
    const nowIn = (data.stockQuantity ?? 0) > 0 && data.publishStatus === "published";
    if (wasOut && nowIn) {
      await notifyBackInStock(productId);
    }

    revalidateCatalog(); // reflect visibility/price/stock changes immediately (Feedback 01)
    return NextResponse.json(updated);
  } catch (error) {
    return productWriteError(error, "update");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCatalogueEditor();
  if (auth.error) return auth.error;

  const { id } = await params;
  const productId = parseInt(id);

  await db.update(products).set({ isActive: false }).where(eq(products.id, productId));
  await db.insert(auditLog).values({
    actorUserId: parseInt(auth.session.user.id),
    action: "product.delete",
    entityType: "product",
    entityId: String(productId),
  });

  revalidateCatalog();
  return NextResponse.json({ success: true });
}
