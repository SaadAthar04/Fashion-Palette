import "dotenv/config";
import { and, eq, lt } from "drizzle-orm";
import { db, pool } from "../src/lib/db/index";
import { orders, auditLog } from "../src/lib/db/schema";

// Phase 2 A6: pre-launch test-data cleanup.
//
// Every order placed while testing the store before launch must be flagged as a
// test order so it is excluded from revenue, order-value and performance stats.
// This marks all non-test orders created BEFORE a cutoff date as test orders.
//
//   Preview (default, no writes):
//     npx tsx scripts/mark-test-orders.ts --before=2026-09-04
//   Apply:
//     npx tsx scripts/mark-test-orders.ts --before=2026-09-04 --apply
//
// If --before is omitted it defaults to the current date (i.e. everything so far
// is treated as pre-launch test data). Individual orders can still be toggled
// back in the admin order detail page.
async function main() {
  const apply = process.argv.includes("--apply");
  const beforeArg = process.argv.find((a) => a.startsWith("--before="))?.split("=")[1];
  const cutoff = beforeArg ? new Date(`${beforeArg}T00:00:00`) : new Date();
  if (Number.isNaN(cutoff.getTime())) {
    console.error(`❌ Invalid --before date: "${beforeArg}". Use YYYY-MM-DD.`);
    await pool.end();
    process.exit(1);
  }

  const pending = await db
    .select({ id: orders.id, orderNumber: orders.orderNumber, total: orders.total, createdAt: orders.createdAt })
    .from(orders)
    .where(and(eq(orders.isTest, false), lt(orders.createdAt, cutoff)))
    .orderBy(orders.createdAt);

  if (pending.length === 0) {
    console.log(`✅ No non-test orders created before ${cutoff.toISOString().slice(0, 10)}. Nothing to mark.`);
    await pool.end();
    process.exit(0);
  }

  console.log(`Found ${pending.length} order(s) created before ${cutoff.toISOString().slice(0, 10)} to mark as TEST:\n`);
  for (const o of pending.slice(0, 50)) {
    console.log(`  • [${o.id}] ${o.orderNumber}  PKR ${o.total}  (${new Date(o.createdAt).toISOString().slice(0, 10)})`);
  }
  if (pending.length > 50) console.log(`  … and ${pending.length - 50} more`);

  if (!apply) {
    console.log(`\nℹ Preview only — nothing changed. Re-run with --apply to flag these as test orders.`);
    await pool.end();
    process.exit(0);
  }

  for (const o of pending) {
    await db.update(orders).set({ isTest: true }).where(eq(orders.id, o.id));
    await db.insert(auditLog).values({
      action: "order.mark_test",
      entityType: "order",
      entityId: String(o.id),
      meta: { reason: "pre-launch test data", cutoff: cutoff.toISOString() },
    });
  }

  console.log(`\n✅ Marked ${pending.length} order(s) as test. They are now excluded from revenue and reports.`);
  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
