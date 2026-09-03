import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "../src/lib/db/index";
import { products, auditLog } from "../src/lib/db/schema";

// Phase 2 A1: reset the "New Arrival" flag across the catalogue.
//
// A bulk import left almost every product flagged as a New Arrival, which
// emptied the section of meaning (nearly all products carried a NEW badge). This
// clears the flag on ALL products so the manager can curate a deliberate
// selection afterwards via the admin product list (bulk "Mark New Arrival").
//
//   Preview (default, no writes):  npx tsx scripts/reset-new-arrivals.ts
//   Apply the reset:               npx tsx scripts/reset-new-arrivals.ts --apply
async function main() {
  const apply = process.argv.includes("--apply");

  const flagged = await db
    .select({ id: products.id, name: products.name, sku: products.sku })
    .from(products)
    .where(eq(products.isNewArrival, true));

  if (flagged.length === 0) {
    console.log(`✅ No products are flagged as New Arrival. Nothing to reset.`);
    await pool.end();
    process.exit(0);
  }

  console.log(`${flagged.length} product(s) currently flagged as New Arrival.`);
  if (!apply) {
    console.log(`\nℹ Preview only — nothing changed. Re-run with --apply to clear the flag on all of them.`);
    console.log(`   Afterwards, curate New Arrivals from the admin product list (select → "Mark New Arrival").`);
    await pool.end();
    process.exit(0);
  }

  await db.update(products).set({ isNewArrival: false }).where(eq(products.isNewArrival, true));
  await db.insert(auditLog).values({
    action: "product.reset_new_arrivals",
    entityType: "product",
    meta: { cleared: flagged.length },
  });

  console.log(`\n✅ Cleared the New Arrival flag on ${flagged.length} product(s). Now curate the section in the admin panel.`);
  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
