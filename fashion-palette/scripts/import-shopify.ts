/**
 * Shopify collection importer (Feedback 06/07/09)
 * ------------------------------------------------
 * Every approved designer source is a Shopify store, so each collection exposes
 * a public `<sourceUrl>/products.json`. This script fetches that, downloads the
 * product images, converts them to WebP (Feedback 06), and inserts products +
 * variants + images into the DB, mapped to the Feedback-09 fields.
 *
 * Usage:
 *   npm run db:import                      # import everything (all collections)
 *   npm run db:import -- --brand=maria-b   # one brand only
 *   npm run db:import -- --limit=5         # cap products per collection (testing)
 *   npm run db:import -- --dry             # fetch + report, write nothing
 *
 * Idempotent: a product whose slug already exists is skipped.
 * Image masters are stored under public/images/products/<brand>/ (Feedback 06
 * asks to keep originals outside the public site — do that in ops, not here).
 */
import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { and, eq } from "drizzle-orm";
import { db, pool } from "../src/lib/db/index";
import * as schema from "../src/lib/db/schema";
import { BRAND_SOURCES } from "../src/lib/data/brand-sources";

// ── CLI args ──────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (k: string) => {
  const hit = args.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.split("=")[1] : undefined;
};
const ONLY_BRAND = getArg("brand");
const PER_COLLECTION_LIMIT = Number(getArg("limit") ?? 0) || Infinity;
const DRY = args.includes("--dry");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const PUBLIC_DIR = path.join(process.cwd(), "public", "images", "products");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Shopify products.json types (subset) ──────────────────
interface ShopifyImage { src: string; }
interface ShopifyVariant {
  id: number;
  title: string;
  option1: string | null;
  option2: string | null;
  sku: string | null;
  price: string;
  compare_at_price: string | null;
  available: boolean;
}
interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[];
  images: ShopifyImage[];
  variants: ShopifyVariant[];
}

// ── Field inference (Feedback 09) ─────────────────────────
function hay(p: ShopifyProduct, collName: string) {
  return `${p.title} ${p.product_type} ${collName} ${(p.tags || []).join(" ")}`.toLowerCase();
}
function inferStitch(h: string): "stitched" | "unstitched" {
  if (/\b(stitched|ready[\s-]?to[\s-]?wear|pret|pr[eê]t)\b/.test(h) && !/un[\s-]?stitched/.test(h))
    return "stitched";
  return "unstitched"; // these collections are overwhelmingly unstitched lawn
}
function inferWork(h: string): "print" | "embroidered" | "plain" | "mixed" {
  const emb = /embroider/.test(h);
  const pr = /\bprint/.test(h);
  if (emb && pr) return "mixed";
  if (emb) return "embroidered";
  if (pr) return "print";
  return "plain";
}
function inferPieces(h: string): "1-piece" | "2-piece" | "3-piece" | null {
  if (/\b3[\s-]?(piece|pc|pcs)\b|three[\s-]?piece/.test(h)) return "3-piece";
  if (/\b2[\s-]?(piece|pc|pcs)\b|two[\s-]?piece/.test(h)) return "2-piece";
  if (/\b1[\s-]?(piece|pc|pcs)\b|one[\s-]?piece|shirt only/.test(h)) return "1-piece";
  return null;
}
function inferCategorySlug(work: string, stitch: string): string {
  if (work === "embroidered") return "embroidered";
  if (work === "print") return "prints";
  return "unstitched";
}
function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 4000);
}
function priceOf(p: ShopifyProduct): { base: string; sale: string | null } {
  // Pick the primary variant; use compare_at_price to detect a genuine sale.
  const v = p.variants[0];
  const price = parseFloat(v?.price ?? "0");
  const compare = v?.compare_at_price ? parseFloat(v.compare_at_price) : 0;
  if (compare > price) return { base: compare.toFixed(2), sale: price.toFixed(2) };
  return { base: price.toFixed(2), sale: null };
}

async function fetchJson(url: string): Promise<ShopifyProduct[] | null> {
  const all: ShopifyProduct[] = [];
  for (let page = 1; page <= 20; page++) {
    const u = `${url.replace(/\/$/, "")}/products.json?limit=250&page=${page}`;
    let res: Response;
    try {
      res = await fetch(u, { headers: { "User-Agent": UA, Accept: "application/json" } });
    } catch (e) {
      console.warn(`   ⚠ network error ${u}: ${(e as Error).message}`);
      return all.length ? all : null;
    }
    if (!res.ok) {
      if (page === 1) {
        console.warn(`   ⚠ ${res.status} for ${u} (not a standard Shopify store?)`);
        return null;
      }
      break;
    }
    const json = (await res.json()) as { products: ShopifyProduct[] };
    if (!json.products?.length) break;
    all.push(...json.products);
    if (json.products.length < 250) break;
    await sleep(400); // be polite
  }
  return all;
}

async function downloadWebp(srcUrl: string, destAbs: string): Promise<boolean> {
  try {
    const res = await fetch(srcUrl, { headers: { "User-Agent": UA } });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).resize(1200, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(destAbs);
    return true;
  } catch (e) {
    console.warn(`     ⚠ image failed ${srcUrl}: ${(e as Error).message}`);
    return false;
  }
}

async function main() {
  console.log(`🛍  Shopify import — ${DRY ? "DRY RUN" : "WRITE"}${ONLY_BRAND ? ` — brand=${ONLY_BRAND}` : ""}`);

  // Resolve brand/category/collection ids from the DB (seed must have run first).
  const brandRows = await db.select().from(schema.brands);
  const catRows = await db.select().from(schema.categories);
  const collectionRows = await db.select().from(schema.collections);
  const brandBySlug = new Map(brandRows.map((b) => [b.slug, b]));
  const catBySlug = new Map(catRows.map((c) => [c.slug, c]));
  const collBySlug = new Map(collectionRows.map((c) => [c.slug, c]));

  let totalCreated = 0, totalSkipped = 0, totalFailed = 0;

  for (const brand of BRAND_SOURCES) {
    if (ONLY_BRAND && brand.slug !== ONLY_BRAND) continue;
    if (!brand.collections.length) continue;
    const brandRow = brandBySlug.get(brand.slug);
    if (!brandRow) { console.warn(`✗ brand not seeded: ${brand.slug}`); continue; }

    for (const coll of brand.collections) {
      console.log(`\n📦 ${brand.name} › ${coll.name}`);
      const products = await fetchJson(coll.sourceUrl);
      if (!products) { totalFailed++; continue; }
      const collRow = collBySlug.get(coll.slug);
      const take = Math.min(products.length, PER_COLLECTION_LIMIT);
      if (take < products.length)
        console.log(`   (importing ${take} of ${products.length} — capped by --limit)`);
      else console.log(`   ${products.length} products found`);

      for (let i = 0; i < take; i++) {
        const p = products[i];
        const slug = `${brand.slug}-${p.handle}`.slice(0, 480);

        const exists = await db.select().from(schema.products).where(eq(schema.products.slug, slug)).limit(1);
        if (exists.length) { totalSkipped++; continue; }

        const h = hay(p, coll.name);
        const stitch = inferStitch(h);
        const work = inferWork(h);
        const pieces = inferPieces(h);
        const { base, sale } = priceOf(p);
        const category = catBySlug.get(inferCategorySlug(work, stitch)) ?? catBySlug.get("unstitched")!;
        const sku = (p.variants[0]?.sku || `FP-${brand.slug}-${p.id}`).slice(0, 100);

        if (DRY) {
          console.log(`   • ${p.title}  [${stitch}/${work}${pieces ? "/" + pieces : ""}]  Rs ${base}${sale ? ` → ${sale}` : ""}  ${p.images.length} img`);
          totalCreated++;
          continue;
        }

        // Download images → WebP
        const brandDir = path.join(PUBLIC_DIR, brand.slug);
        await fs.mkdir(brandDir, { recursive: true });
        const savedImages: string[] = [];
        for (let n = 0; n < Math.min(p.images.length, 6); n++) {
          const rel = `/images/products/${brand.slug}/${p.handle}-${n + 1}.webp`;
          const ok = await downloadWebp(p.images[n].src, path.join(process.cwd(), "public", rel));
          if (ok) savedImages.push(rel);
        }
        if (!savedImages.length) {
          console.warn(`   ⚠ no images for "${p.title}" — skipping`);
          totalFailed++;
          continue;
        }

        // Insert product (draft until reviewed — Feedback 22)
        const inserted = await db.insert(schema.products).values({
          name: p.title.slice(0, 500),
          slug,
          shortDescription: stripHtml(p.body_html).slice(0, 1000) || null,
          description: stripHtml(p.body_html) || null,
          brandId: brandRow.id,
          categoryId: category.id,
          collectionId: collRow?.id ?? null,
          basePrice: base,
          salePrice: sale,
          sku,
          originalProductCode: String(p.id),
          season: coll.season ?? null,
          sourceUrl: coll.sourceUrl,
          stitchType: stitch,
          workType: work,
          pieceCount: pieces,
          fabric: /lawn/.test(h) ? "Lawn" : /chiffon/.test(h) ? "Chiffon" : /cotton/.test(h) ? "Cotton" : null,
          isNewArrival: true,
          isActive: true,
          publishStatus: "draft", // review before publishing
          stockQuantity: p.variants.some((v) => v.available) ? 10 : 0,
          metaTitle: p.title.slice(0, 255),
          metaDescription: stripHtml(p.body_html).slice(0, 300) || null,
        });
        const productId = Number((inserted as unknown as { insertId: number }).insertId ?? (inserted as unknown as [{ insertId: number }])[0]?.insertId);

        // Images
        await db.insert(schema.productImages).values(
          savedImages.map((url, idx) => ({
            productId, imageUrl: url, altText: p.title.slice(0, 255), sortOrder: idx, isPrimary: idx === 0,
          }))
        );

        // Size variants (skip Shopify's synthetic "Default Title")
        const sizeVariants = p.variants.filter((v) => v.option1 && v.option1 !== "Default Title");
        if (sizeVariants.length) {
          await db.insert(schema.productVariants).values(
            sizeVariants.map((v) => ({
              productId,
              size: v.option1!.slice(0, 20),
              color: v.option2?.slice(0, 50) ?? null,
              stockQuantity: v.available ? 10 : 0,
              priceAdjustment: "0.00",
              skuSuffix: v.sku?.slice(0, 20) ?? null,
            }))
          );
        }

        totalCreated++;
        process.stdout.write(`   ✓ ${p.title.slice(0, 60)}\n`);
        await sleep(150);
      }
    }
  }

  console.log(`\n${DRY ? "Would create" : "Created"}: ${totalCreated}  |  Skipped(existing): ${totalSkipped}  |  Failed collections/products: ${totalFailed}`);
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
