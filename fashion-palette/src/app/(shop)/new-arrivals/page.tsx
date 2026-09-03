import { Metadata } from "next";
import { db } from "@/lib/db";
import { products, brands } from "@/lib/db/schema";
import { eq, and, desc, gt } from "drizzle-orm";
import CategoryPageClient from "@/app/(shop)/categories/[slug]/CategoryPageClient";

export const revalidate = 300; // ISR: cache 5 min (public catalog)

export const metadata: Metadata = {
  title: "New Arrivals",
  description:
    "Discover the latest arrivals in Pakistani women's fashion. Fresh collections from top designers at Fashion Palette.",
  alternates: { canonical: "/new-arrivals" },
};

export default async function NewArrivalsPage() {
  // Phase 2 A4: New Arrivals now offers the same filter + sort controls as the
  // category pages (reusing CategoryPageClient) instead of a plain grid.
  const [newProducts, allBrands] = await Promise.all([
    db.query.products.findMany({
      where: and(
        eq(products.isNewArrival, true),
        eq(products.isActive, true),
        eq(products.publishStatus, "published"),
        gt(products.basePrice, "0")
      ),
      with: { brand: true, images: true },
      orderBy: [desc(products.createdAt)],
    }),
    db.select().from(brands).where(eq(brands.isActive, true)).orderBy(brands.name),
  ]);

  return (
    <CategoryPageClient
      slug="new-arrivals"
      categoryName="New Arrivals"
      categoryIntro="The latest drops from Pakistan's top designers"
      products={newProducts as any[]}
      brands={allBrands}
    />
  );
}
