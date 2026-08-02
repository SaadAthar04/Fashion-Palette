import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "../src/lib/db/index";
import { products } from "../src/lib/db/schema";
import { summarize } from "../src/lib/text";

// Feedback 02/08/42: fix catalogue text on existing products —
//  - shortDescription that merely duplicates the full description
//  - missing/oversized SEO meta title/description
//  - flag any residual character corruption (needs re-import to fix source)
async function main() {
  const all = await db.query.products.findMany({ with: { brand: true } });
  let shortFixed = 0, metaTitleFixed = 0, metaDescFixed = 0, corrupted = 0;

  for (const p of all) {
    const update: Record<string, unknown> = {};
    const desc = (p.description || "").trim();
    const short = (p.shortDescription || "").trim();

    // 1. Short description must be a genuine summary, not a copy of the full text.
    if (desc) {
      const duplicates = !short || short === desc || desc.startsWith(short) || short.length > 220;
      if (duplicates) {
        const summary = summarize(desc);
        if (summary && summary !== desc) {
          update.shortDescription = summary;
          shortFixed++;
        }
      }
    }

    // 2. Meta title — descriptive and unique.
    if (!p.metaTitle || !p.metaTitle.trim()) {
      update.metaTitle = `${p.name}${p.brand ? ` — ${p.brand.name}` : ""} | Fashion Palette`.slice(0, 255);
      metaTitleFixed++;
    }

    // 3. Meta description — concise, complete (≤160 chars).
    const md = (p.metaDescription || "").trim();
    if (!md || md.length > 200) {
      const newMd = desc ? summarize(desc, 155) : (update.shortDescription as string) || short;
      if (newMd) {
        update.metaDescription = newMd;
        metaDescFixed++;
      }
    }

    // 4. Detect residual mojibake / replacement chars.
    if (/[�]/.test(p.name + " " + desc)) {
      corrupted++;
      console.log(`   ⚠ possible corruption: ${p.slug}`);
    }

    if (Object.keys(update).length) {
      await db.update(products).set(update).where(eq(products.id, p.id));
    }
  }

  console.log(
    `✅ Cleaned ${all.length} products — short:${shortFixed} metaTitle:${metaTitleFixed} metaDesc:${metaDescFixed} corrupted:${corrupted}`
  );
  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
