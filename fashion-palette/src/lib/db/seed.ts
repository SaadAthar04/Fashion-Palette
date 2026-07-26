import "dotenv/config";
import { db, pool } from "./index";
import * as schema from "./schema";
import { BRAND_SOURCES, STOREFRONT_CATEGORIES } from "../data/brand-sources";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database (approved brands, categories, collections, admin)...");

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

  console.log("🎉 Seeding complete!");
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
