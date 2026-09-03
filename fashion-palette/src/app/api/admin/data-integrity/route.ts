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

  // Phase 2 A2/A6: a published product is "incomplete" when a required
  // merchandising field is missing (fabric, colour, work type or piece count).
  const missingRequiredCond = and(
    eq(products.publishStatus, "published"),
    or(
      isNull(products.fabric), eq(products.fabric, ""),
      isNull(products.color), eq(products.color, ""),
      isNull(products.workType),
      isNull(products.pieceCount)
    )
  );

  // A6: corrupted / placeholder text — the Unicode replacement character, common
  // mojibake ("Ã", "Â€"), or obvious placeholder words in customer-facing text.
  const corruptedCond = or(
    sql`${products.name} LIKE '%�%'`,
    sql`${products.shortDescription} LIKE '%�%'`,
    sql`${products.description} LIKE '%�%'`,
    sql`${products.name} LIKE '%Ã%'`,
    sql`${products.shortDescription} LIKE '%Ã%'`,
    sql`${products.name} LIKE '%Â€%'`,
    sql`LOWER(${products.name}) LIKE '%lorem ipsum%'`,
    sql`LOWER(${products.shortDescription}) LIKE '%lorem ipsum%'`,
    sql`LOWER(${products.name}) LIKE '%placeholder%'`
  );

  const [
    zeroPrice,
    lowPrice,
    dupSkuGroups,
    dupSlugGroups,
    missingImages,
    missingDescription,
    missingStock,
    incompletePublished,
    missingAltText,
    missingStructuredDetails,
    corruptedText,
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
    // A2: published but missing a required merchandising field.
    withBrand().where(missingRequiredCond).orderBy(desc(products.updatedAt)).limit(200),
    // A6: published products with at least one image missing alt text.
    withBrand()
      .where(
        and(
          eq(products.publishStatus, "published"),
          sql`EXISTS (SELECT 1 FROM ${productImages} WHERE ${productImages.productId} = ${products.id} AND (${productImages.altText} IS NULL OR ${productImages.altText} = ''))`
        )
      )
      .limit(200),
    // A6: published products with no structured details (What's included / care).
    withBrand()
      .where(and(eq(products.publishStatus, "published"), isNull(products.details)))
      .limit(200),
    // A6: corrupted / placeholder text in customer-facing fields.
    withBrand().where(corruptedCond).limit(200),
  ]);

  const totalIssues =
    zeroPrice.length +
    lowPrice.length +
    dupSkuGroups.length +
    dupSlugGroups.length +
    missingImages.length +
    missingDescription.length +
    missingStock.length +
    incompletePublished.length +
    missingAltText.length +
    corruptedText.length;
  // (missingStructuredDetails is a recommended/quality flag, excluded from the
  // launch-blocking totalIssues count but still returned for the report.)

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
    incompletePublished,
    missingAltText,
    missingStructuredDetails,
    corruptedText,
  });
}
