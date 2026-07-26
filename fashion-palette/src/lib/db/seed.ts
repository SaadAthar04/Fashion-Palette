import "dotenv/config";
import { db, pool } from "./index";
import * as schema from "./schema";
import { BRAND_SOURCES, STOREFRONT_CATEGORIES } from "../data/brand-sources";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database (approved brands, categories, collections, samples)...");

  // ── Dev reset: make `npm run db:seed` re-runnable (child → parent order) ──
  // Dev-only convenience; the deploy pipeline never runs the seed.
  await db.delete(schema.productVariants);
  await db.delete(schema.productImages);
  await db.delete(schema.products);
  await db.delete(schema.collections);
  await db.delete(schema.categories);
  await db.delete(schema.users);
  await db.delete(schema.brands);
  console.log("🧹 Existing seed rows cleared");

  // ── Brands (Feedback 02: approved + sourced, alphabetical, one spelling) ──
  // Approved brands with no image source yet (Baroque, Zainab Chottani) are
  // seeded inactive/hidden until the client supplies collection links.
  await db.insert(schema.brands).values(
    BRAND_SOURCES.map((b, i) => ({
      name: b.name,
      slug: b.slug,
      logoUrl: null, // real logos added via admin / importer
      isActive: b.hasSource,
      sortOrder: i,
    }))
  );
  const brandRows = await db.select().from(schema.brands);
  const brandId = (slug: string) => brandRows.find((r) => r.slug === slug)!.id;
  console.log(`✅ ${brandRows.length} brands seeded`);

  // ── Categories (Feedback 01 nav taxonomy) ──
  await db.insert(schema.categories).values(
    STOREFRONT_CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      isActive: true,
      sortOrder: c.sortOrder,
    }))
  );
  const catRows = await db.select().from(schema.categories);
  const catId = (slug: string) => catRows.find((r) => r.slug === slug)!.id;
  console.log(`✅ ${catRows.length} categories seeded`);

  // ── Collections (Feedback 02/09: brand drops with designer source URL) ──
  const collectionValues = BRAND_SOURCES.flatMap((b) =>
    b.collections.map((c, i) => ({
      brandId: brandId(b.slug),
      name: c.name,
      slug: c.slug,
      season: c.season ?? null,
      sourceUrl: c.sourceUrl,
      isActive: true,
      sortOrder: i,
    }))
  );
  if (collectionValues.length) await db.insert(schema.collections).values(collectionValues);
  const collectionRows = await db.select().from(schema.collections);
  const collId = (slug: string) => collectionRows.find((r) => r.slug === slug)?.id ?? null;
  console.log(`✅ ${collectionRows.length} collections seeded`);

  // ── Admin + a staff catalogue editor (Feedback 22: least-privilege roles) ──
  await db.insert(schema.users).values([
    {
      name: "Admin",
      email: "admin@fashionpalette.pk",
      passwordHash: await bcrypt.hash("admin123", 12),
      phone: "03276796087",
      role: "admin",
      emailVerifiedAt: new Date(),
    },
    {
      name: "Catalogue Editor",
      email: "catalogue@fashionpalette.pk",
      passwordHash: await bcrypt.hash("catalogue123", 12),
      role: "catalogue_editor",
      emailVerifiedAt: new Date(),
    },
  ]);
  console.log("✅ Admin + catalogue-editor users seeded");

  // ── Sample products (Feedback 07): 1 normal, 1 on sale, 1 with size variants ──
  // Real images arrive via the Shopify importer; these use placeholders for testing.
  await db.insert(schema.products).values([
    {
      // 1) normal-price, unstitched 3-piece
      name: "Maria B Lawn — Unstitched 3-Piece (Sample)",
      slug: "sample-maria-b-lawn-3pc",
      shortDescription: "Digital printed lawn shirt with embroidered front, cambric trouser and chiffon dupatta.",
      description:
        "A three-piece unstitched lawn suit: digitally printed shirt with an embroidered front panel, dyed cambric trouser and a printed chiffon dupatta. Sample product used to test product pages, cart and checkout.",
      brandId: brandId("maria-b"),
      categoryId: catId("unstitched"),
      collectionId: collId("maria-b-lawn"),
      basePrice: "8500.00",
      sku: "FP-MB-LAWN-001",
      originalProductCode: "MB-LAWN-3PC-01",
      season: "Summer 2026",
      sourceUrl: "https://www.mariab.pk/collections/lawn",
      stitchType: "unstitched",
      workType: "print",
      pieceCount: "3-piece",
      fabric: "Lawn",
      shirtFabric: "Lawn",
      trouserFabric: "Cambric",
      dupattaFabric: "Chiffon",
      color: "Teal",
      careInstructions: "Dry clean recommended. Do not bleach.",
      deliveryEstimate: "3-5 working days",
      returnEligible: true,
      taxStatus: "inclusive",
      isNewArrival: true,
      isActive: true,
      publishStatus: "published",
      stockQuantity: 20,
      metaTitle: "Maria B Unstitched Lawn 3-Piece",
      metaDescription: "Digital printed unstitched lawn 3-piece by Maria B.",
    },
    {
      // 2) on sale, unstitched printed
      name: "Zaha Lawn 26 — Unstitched (Sample, On Sale)",
      slug: "sample-zaha-lawn-26",
      shortDescription: "Printed luxury lawn with embroidered borders — limited-time price.",
      description:
        "Zaha Lawn 26 unstitched printed suit with embroidered borders. Sample product on sale to test discount display and price revalidation at checkout.",
      brandId: brandId("zaha"),
      categoryId: catId("prints"),
      collectionId: collId("zaha-lawn-26"),
      basePrice: "9800.00",
      salePrice: "7350.00",
      sku: "FP-ZH-LAWN-002",
      originalProductCode: "ZAHA-LAWN26-14",
      season: "Summer 2026",
      sourceUrl: "https://www.zaha.pk/collections/zaha-lawn26",
      stitchType: "unstitched",
      workType: "print",
      pieceCount: "3-piece",
      fabric: "Lawn",
      color: "Coral",
      careInstructions: "Gentle hand wash cold. Iron on reverse.",
      deliveryEstimate: "3-5 working days",
      returnEligible: true,
      taxStatus: "inclusive",
      isNewArrival: true,
      isBestSeller: true,
      isActive: true,
      publishStatus: "published",
      stockQuantity: 15,
      metaTitle: "Zaha Lawn 26 Unstitched (Sale)",
      metaDescription: "Printed luxury lawn by Zaha at a limited-time price.",
    },
    {
      // 3) selectable size — stitched embroidered
      name: "Elan Lawn 26 — Stitched Embroidered (Sample, Sized)",
      slug: "sample-elan-lawn-26-stitched",
      shortDescription: "Ready-to-wear embroidered lawn — choose your size.",
      description:
        "Elan Lawn 26 ready-to-wear embroidered suit with selectable sizes. Sample product used to test size-variant selection and per-variant stock.",
      brandId: brandId("elan"),
      categoryId: catId("embroidered"),
      collectionId: collId("elan-lawn-26"),
      basePrice: "16500.00",
      sku: "FP-EL-LAWN-003",
      originalProductCode: "ELAN-LAWN26-07",
      season: "Summer 2026",
      sourceUrl: "https://elan.pk/collections/elan-lawn26",
      stitchType: "stitched",
      workType: "embroidered",
      pieceCount: "3-piece",
      fabric: "Lawn",
      color: "Ivory",
      careInstructions: "Dry clean only.",
      deliveryEstimate: "3-5 working days",
      returnEligible: true,
      taxStatus: "inclusive",
      isFeatured: true,
      isActive: true,
      publishStatus: "published",
      stockQuantity: 24,
      metaTitle: "Elan Lawn 26 Stitched Embroidered",
      metaDescription: "Ready-to-wear embroidered lawn by Elan — selectable sizes.",
    },
  ]);
  const productRows = await db.select().from(schema.products);
  const pid = (slug: string) => productRows.find((r) => r.slug === slug)!.id;
  console.log(`✅ ${productRows.length} sample products seeded`);

  // ── Product images (placeholder — importer replaces with real WebP) ──
  await db.insert(schema.productImages).values(
    productRows.map((p) => ({
      productId: p.id,
      imageUrl: "/images/placeholder/product-1.jpg",
      altText: p.name,
      sortOrder: 0,
      isPrimary: true,
    }))
  );
  console.log("✅ Product images seeded (placeholders)");

  // ── Variants only for the sized sample (Feedback 07) ──
  await db.insert(schema.productVariants).values([
    { productId: pid("sample-elan-lawn-26-stitched"), size: "S", stockQuantity: 6, priceAdjustment: "0.00", skuSuffix: "S" },
    { productId: pid("sample-elan-lawn-26-stitched"), size: "M", stockQuantity: 8, priceAdjustment: "0.00", skuSuffix: "M" },
    { productId: pid("sample-elan-lawn-26-stitched"), size: "L", stockQuantity: 6, priceAdjustment: "0.00", skuSuffix: "L" },
    { productId: pid("sample-elan-lawn-26-stitched"), size: "XL", stockQuantity: 4, priceAdjustment: "0.00", skuSuffix: "XL" },
  ]);
  console.log("✅ Product variants seeded");

  console.log("🎉 Seeding complete!");
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
