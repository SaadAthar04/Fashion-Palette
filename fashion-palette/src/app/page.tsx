export const revalidate = 300; // ISR: cache 5 min (public catalog)

import { db } from "@/lib/db";
import { products, brands, categories } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import NewArrivals from "@/components/home/NewArrivals";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import StitchingService from "@/components/home/StitchingService";
import BrandCarousel from "@/components/home/BrandCarousel";
import BestSellers from "@/components/home/BestSellers";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import TrustBadges from "@/components/shared/TrustBadges";

async function getHomeData() {
  const [allCategories, allBrands, allProducts] = await Promise.all([
    db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder),
    db.select().from(brands).where(eq(brands.isActive, true)).orderBy(brands.name),
    db.query.products.findMany({
      where: and(eq(products.isActive, true), eq(products.publishStatus, "published")),
      with: { brand: true, images: true },
      orderBy: [desc(products.createdAt)],
    }),
  ]);
  return { allCategories, allBrands, allProducts };
}

type ProductWithImages = Awaited<ReturnType<typeof getHomeData>>["allProducts"][number];
const primaryImage = (p: ProductWithImages) =>
  p.images?.find((i) => i.isPrimary)?.imageUrl ?? p.images?.[0]?.imageUrl ?? null;

export default async function HomePage() {
  const { allCategories, allBrands, allProducts } = await getHomeData();

  // Derive real imagery from the catalogue so no section shows a placeholder.
  const catImg: Record<number, string> = {};
  const brandImg: Record<number, string> = {};
  for (const p of allProducts) {
    const img = primaryImage(p);
    if (!img) continue;
    if (p.categoryId && !catImg[p.categoryId]) catImg[p.categoryId] = img;
    if (p.brandId && !brandImg[p.brandId]) brandImg[p.brandId] = img;
  }

  // "Stitching" is a service (its own page), not a shoppable category grid tile.
  const enrichedCategories = allCategories
    .filter((c) => c.slug !== "stitching")
    .map((c) => ({ ...c, imageUrl: catImg[c.id] ?? c.imageUrl }));
  const enrichedBrands = allBrands
    .map((b) => ({ id: b.id, name: b.name, slug: b.slug, image: brandImg[b.id] ?? null }))
    .filter((b) => b.image); // only show brands that actually have imagery

  const bySlug = (s: string) => allCategories.find((c) => c.slug === s);
  const printsImage = catImg[bySlug("prints")?.id ?? -1] ?? null;
  const embroideredImage = catImg[bySlug("embroidered")?.id ?? -1] ?? null;

  const newArrivals = allProducts.filter((p) => p.isNewArrival);
  const bestSellers = allProducts.filter((p) => p.isBestSeller);

  const heroSource = (newArrivals.length > 0 ? newArrivals : allProducts).filter((p) => primaryImage(p));
  const heroSlides = heroSource.slice(0, 5).map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand?.name ?? "",
    image: primaryImage(p)!,
  }));

  // Cap what we hand to client sections — every imported product is flagged
  // "new arrival", so without a cap the homepage would render ~520 cards.
  const newArrivalCards = (newArrivals.length > 0 ? newArrivals : allProducts).slice(0, 8);
  const bestSellerCards = (bestSellers.length > 0 ? bestSellers : allProducts).slice(8, 16);

  return (
    <>
      <HeroBanner slides={heroSlides} />
      <NewArrivals products={newArrivalCards} />
      <CategoryGrid categories={enrichedCategories} />
      {enrichedBrands.length > 0 && <BrandCarousel brands={enrichedBrands} />}
      {bestSellerCards.length > 0 && <BestSellers products={bestSellerCards} />}
      <FeaturedCollections printsImage={printsImage} embroideredImage={embroideredImage} />
      <StitchingService />

      <section className="py-14 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="border-t border-b border-border/50 py-10 md:py-12">
            <TrustBadges />
          </div>
        </div>
      </section>

      <NewsletterSignup />
    </>
  );
}
