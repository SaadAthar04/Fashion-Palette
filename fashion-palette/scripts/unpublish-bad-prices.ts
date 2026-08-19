import "dotenv/config";
import { and, eq, lt, or, lte } from "drizzle-orm";
import { db, pool } from "../src/lib/db/index";
import { products, brands, auditLog } from "../src/lib/db/schema";
import { LOW_PRICE_WARNING_PKR } from "../src/lib/constants";

// Final feedback A1: pre-launch price safety net.
//
// The live catalogue had 35 products priced below PKR 1,000 (Suffuse ~Rs.77–92,
// Saira Shakira ~Rs.217–238, Kanwal Malik Rs.0) — almost certainly un-converted
// foreign-currency values or missing prices. This script UNPUBLISHES any product
// whose base price is zero/negative or below the low-price floor, so an incorrect
// price can never reach the storefront/cart. It does NOT invent prices — the
// owner must enter verified PKR prices, after which the product can be re-published.
//
//   Preview (default, no writes):  npx tsx scripts/unpublish-bad-prices.ts
//   Apply the changes:             npx tsx scripts/unpublish-bad-prices.ts --apply
//
// Only currently-published products are changed (drafts/hidden are already off-sale).
async function main() {
  const apply = process.argv.includes("--apply");
  const floor = String(LOW_PRICE_WARNING_PKR);

  const bad = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      basePrice: products.basePrice,
      publishStatus: products.publishStatus,
      brand: brands.name,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(
      and(
        eq(products.publishStatus, "published"),
        or(lte(products.basePrice, "0"), lt(products.basePrice, floor))
      )
    )
    .orderBy(products.basePrice);

  if (bad.length === 0) {
    console.log(`✅ No published product priced below PKR ${LOW_PRICE_WARNING_PKR}. Nothing to unpublish.`);
    await pool.end();
    process.exit(0);
  }

  console.log(`Found ${bad.length} published product(s) with a suspicious price (< PKR ${LOW_PRICE_WARNING_PKR}):\n`);
  for (const p of bad) {
    console.log(`  • [${p.id}] ${p.brand ?? "—"} — ${p.name} (SKU ${p.sku})  PKR ${p.basePrice}`);
  }

  if (!apply) {
    console.log(`\nℹ Preview only — nothing changed. Re-run with --apply to move these to "draft".`);
    await pool.end();
    process.exit(0);
  }

  for (const p of bad) {
    await db.update(products).set({ publishStatus: "draft" }).where(eq(products.id, p.id));
    await db.insert(auditLog).values({
      action: "product.unpublish_bad_price",
      entityType: "product",
      entityId: String(p.id),
      meta: { reason: "price below low-price floor", basePrice: p.basePrice, floor: LOW_PRICE_WARNING_PKR },
    });
  }

  console.log(`\n✅ Unpublished ${bad.length} product(s) → status "draft". Enter verified PKR prices, then re-publish.`);
  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
