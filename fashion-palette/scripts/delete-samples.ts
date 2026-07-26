import "dotenv/config";
import { like, inArray } from "drizzle-orm";
import { db, pool } from "../src/lib/db/index";
import { products, productImages, productVariants } from "../src/lib/db/schema";

// Removes the 3 seed sample products (slug like 'sample-%') and their
// images/variants, without touching the real imported catalogue.
async function main() {
  const samples = await db.select({ id: products.id }).from(products).where(like(products.slug, "sample-%"));
  const ids = samples.map((s) => s.id);
  if (!ids.length) {
    console.log("No sample products found.");
    await pool.end();
    process.exit(0);
  }
  await db.delete(productVariants).where(inArray(productVariants.productId, ids));
  await db.delete(productImages).where(inArray(productImages.productId, ids));
  await db.delete(products).where(inArray(products.id, ids));
  console.log(`✅ Deleted ${ids.length} sample product(s)`);
  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Failed:", e.message);
  process.exit(1);
});
