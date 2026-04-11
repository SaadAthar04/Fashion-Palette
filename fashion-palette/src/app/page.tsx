export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { products, brands, categories, banners, productImages } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import NewArrivals from "@/components/home/NewArrivals";
import SaleBanner from "@/components/home/SaleBanner";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import BrandCarousel from "@/components/home/BrandCarousel";
import BestSellers from "@/components/home/BestSellers";
import Testimonials from "@/components/home/Testimonials";
import InstagramFeed from "@/components/home/InstagramFeed";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import TrustBadges from "@/components/shared/TrustBadges";

async function getHomeData() {
  const [allBanners, allCategories, allBrands, allProducts] = await Promise.all([
    db.select().from(banners).where(eq(banners.isActive, true)).orderBy(banners.sortOrder),
    db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder),
    db.select().from(brands).where(eq(brands.isActive, true)).orderBy(brands.sortOrder),
    db.query.products.findMany({
      where: eq(products.isActive, true),
      with: {
        brand: true,
        images: true,
      },
      orderBy: [desc(products.createdAt)],
    }),
  ]);

  return { allBanners, allCategories, allBrands, allProducts };
}

export default async function HomePage() {
  const { allBanners, allCategories, allBrands, allProducts } = await getHomeData();

  const newArrivals = allProducts.filter((p) => p.isNewArrival);
  const bestSellers = allProducts.filter((p) => p.isBestSeller);

  return (
    <>
      <HeroBanner banners={allBanners} />
      <CategoryGrid categories={allCategories} />
      <NewArrivals products={newArrivals.length > 0 ? newArrivals : allProducts.slice(0, 4)} />
      <SaleBanner />
      <FeaturedCollections />
      <BrandCarousel brands={allBrands} />
      <BestSellers products={bestSellers.length > 0 ? bestSellers : allProducts.slice(4)} />

      {/* Trust Badges */}
      <section className="py-14 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="border-t border-b border-border/50 py-10 md:py-12">
            <TrustBadges />
          </div>
        </div>
      </section>

      <Testimonials />
      <InstagramFeed />
      <NewsletterSignup />
    </>
  );
}
