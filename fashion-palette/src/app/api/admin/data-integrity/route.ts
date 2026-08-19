import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages, brands } from "@/lib/db/schema";
import { and, eq, or, isNull, sql, lte, gt, lt, count, desc } from "drizzle-orm";
import { requireRole } from "@/lib/admin";
import { LOW_PRICE_WARNING_PKR } from "@/lib/constants";

// Final feedback A1: pre-launch data-integrity audit. Surfaces zero/low prices,
// duplicate SKUs/slugs, and missing images/descriptions/stock so nothing broken
// reaches the storefront. Read-only — corrections are made in the product editor.
export async function GET() {
  const auth = await requireRole(["admin", "catalogue_editor", "order_manager"]);
  if (auth.error) return auth.error;

  const brandName = brands.name;
  const baseCols = {
    id: products.id,
    name: products.name,
    sku: products.sku,
    slug: products.slug,
    basePrice: products.basePrice,
    stock: products.stockQuantity,
    publishStatus: products.publishStatus,
    brand: brandName,
  };
  const withBrand = () => db.select(baseCols).from(products).leftJoin(brands, eq(products.brandId, brands.id));

  const [
    zeroPrice,
    lowPrice,
    dupSkuGroups,
    dupSlugGroups,
    missingImages,
    missingDescription,
    missingStock,
  ] = await Promise.all([
    // Zero / negative / (defensively) any non-positive price.
    withBrand().where(lte(products.basePrice, "0")).orderBy(desc(products.updatedAt)).limit(200),
    // Unusually low price — likely un-converted foreign currency.
    withBrand()
      .where(and(gt(products.basePrice, "0"), lt(products.basePrice, String(LOW_PRICE_WARNING_PKR))))
      .orderBy(products.basePrice)
      .limit(200),
    // Duplicate SKUs (unique constraint should prevent these; report legacy data).
    db.select({ value: products.sku, c: count() }).from(products).groupBy(products.sku).having(sql`count(*) > 1`),
    // Duplicate slugs.
    db.select({ value: products.slug, c: count() }).from(products).groupBy(products.slug).having(sql`count(*) > 1`),
    // Products with no images at all.
    withBrand()
      .where(
        and(
          eq(products.isActive, true),
          sql`NOT EXISTS (SELECT 1 FROM ${productImages} WHERE ${productImages.productId} = ${products.id})`
        )
      )
      .limit(200),
    // Missing both long and short description.
    withBrand()
      .where(
        and(
          eq(products.isActive, true),
          or(isNull(products.description), eq(products.description, "")),
          or(isNull(products.shortDescription), eq(products.shortDescription, ""))
        )
      )
      .limit(200),
    // Published but out of stock (customers see it but can't buy).
    withBrand()
      .where(and(eq(products.publishStatus, "published"), lte(products.stockQuantity, 0)))
      .limit(200),
  ]);

  const totalIssues =
    zeroPrice.length +
    lowPrice.length +
    dupSkuGroups.length +
    dupSlugGroups.length +
    missingImages.length +
    missingDescription.length +
    missingStock.length;

  return NextResponse.json({
    lowPriceThreshold: LOW_PRICE_WARNING_PKR,
    totalIssues,
    zeroPrice,
    lowPrice,
    duplicateSku: dupSkuGroups,
    duplicateSlug: dupSlugGroups,
    missingImages,
    missingDescription,
    missingStock,
  });
}
