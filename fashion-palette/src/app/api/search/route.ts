import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, brands, categories, collections } from "@/lib/db/schema";
import { and, or, like, eq, inArray, desc } from "drizzle-orm";

// Feedback 13: search by title, brand, product code, category, collection.
// Returns grouped results ({ products, brands, categories }) so the same route
// powers both the autocomplete overlay (suggest=1) and the results page.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const suggest = searchParams.get("suggest") === "1";

  if (!query) return NextResponse.json({ products: [], brands: [], categories: [] });

  const term = `%${query}%`;

  const [matchBrands, matchCats, matchColls] = await Promise.all([
    db.select().from(brands).where(and(eq(brands.isActive, true), like(brands.name, term))).limit(6),
    db.select().from(categories).where(and(eq(categories.isActive, true), like(categories.name, term))).limit(6),
    db.select({ id: collections.id }).from(collections).where(like(collections.name, term)).limit(30),
  ]);

  const conditions = [
    like(products.name, term),
    like(products.shortDescription, term),
    like(products.sku, term),
    like(products.originalProductCode, term),
    like(products.fabric, term),
    like(products.color, term),
  ];
  if (matchBrands.length) conditions.push(inArray(products.brandId, matchBrands.map((b) => b.id)));
  if (matchCats.length) conditions.push(inArray(products.categoryId, matchCats.map((c) => c.id)));
  if (matchColls.length) conditions.push(inArray(products.collectionId, matchColls.map((c) => c.id)));

  const results = await db.query.products.findMany({
    where: and(
      eq(products.isActive, true),
      eq(products.publishStatus, "published"),
      or(...conditions)
    ),
    with: { brand: true, images: true },
    orderBy: [desc(products.createdAt)],
    limit: suggest ? 6 : 48,
  });

  return NextResponse.json({ products: results, brands: matchBrands, categories: matchCats });
}
