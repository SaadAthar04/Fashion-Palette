import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages, productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { productSchema } from "@/lib/validators";

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
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  const productId = parseInt(id);

  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    await db.update(products).set(data).where(eq(products.id, productId));

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

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  await db
    .update(products)
    .set({ isActive: false })
    .where(eq(products.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
