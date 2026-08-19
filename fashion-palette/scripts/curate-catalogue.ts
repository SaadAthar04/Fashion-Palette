import "dotenv/config";
import { and, eq, lt, sql } from "drizzle-orm";
import { db, pool } from "../src/lib/db/index";
import { products } from "../src/lib/db/schema";

// Final feedback A4: catalogue presentation cleanup (data).
//   npx tsx scripts/curate-catalogue.ts            # preview only
//   npx tsx scripts/curate-catalogue.ts --apply    # apply changes
//
// 1) New Arrivals should be a curated, date-based collection — not the whole
//    catalogue. Clears the "new arrival" flag on products older than 30 days so
//    only genuine recent launches keep the NEW badge (managers can still hand-pick
//    others in the product editor).
// 2) Fixes corrupted "Suiy?" / "Suiy<mojibake>" product text to "Suiyo".
// 3) Flags Urban Whisper JPU25-06 for a manual Lawn-vs-Cambric fabric decision.
async function main() {
  const apply = process.argv.includes("--apply");
  const NEW_ARRIVAL_DAYS = 30;

  // 1) Date-based New Arrivals curation.
  const staleNew = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.isNewArrival, true), lt(products.createdAt, sql`DATE_SUB(NOW(), INTERVAL ${NEW_ARRIVAL_DAYS} DAY)`)));
  console.log(`New Arrivals: ${staleNew.length} product(s) older than ${NEW_ARRIVAL_DAYS} days still flagged NEW.`);
  if (apply && staleNew.length) {
    await db
      .update(products)
      .set({ isNewArrival: false })
      .where(and(eq(products.isNewArrival, true), lt(products.createdAt, sql`DATE_SUB(NOW(), INTERVAL ${NEW_ARRIVAL_DAYS} DAY)`)));
    console.log(`  ✓ cleared NEW on ${staleNew.length} older product(s).`);
  }

  // 2) Fix corrupted "Suiy?" text.
  const all = await db.query.products.findMany();
  let fixed = 0;
  const CORRUPT = /Suiy[�?ï¿½]+/g; // "Suiy" followed by replacement/mojibake chars
  for (const p of all) {
    const patch: Record<string, string> = {};
    for (const field of ["name", "description", "shortDescription"] as const) {
      const val = p[field];
      if (val && CORRUPT.test(val)) {
        patch[field] = val.replace(CORRUPT, "Suiyo");
      }
      CORRUPT.lastIndex = 0;
    }
    if (Object.keys(patch).length) {
      console.log(`  Suiyo fix on [${p.id}] ${p.slug}: ${Object.keys(patch).join(", ")}`);
      fixed++;
      if (apply) await db.update(products).set(patch).where(eq(products.id, p.id));
    }
    // 3) Flag Urban Whisper JPU25-06 fabric for manual review.
    if (/JPU25-06/i.test(`${p.sku} ${p.originalProductCode ?? ""} ${p.name}`)) {
      console.log(`  ⚠ Urban Whisper JPU25-06 [${p.id}] fabric = "${p.fabric ?? "—"}" — confirm Lawn vs Cambric and set one consistent value.`);
    }
  }
  console.log(`Corrupted-text fixes: ${fixed} product(s)${apply ? " applied" : " (preview)"}.`);

  if (!apply) console.log(`\nℹ Preview only — re-run with --apply to write changes.`);
  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
