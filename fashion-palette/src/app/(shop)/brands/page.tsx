import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { brands, products } from "@/lib/db/schema";
import { eq, and, sql, gt, desc } from "drizzle-orm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import { getImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

export const revalidate = 300; // ISR: cache 5 min (public catalog)

export const metadata: Metadata = {
  title: "Brands",
  description:
    "Shop leading Pakistani designers — Maria B, Elan, Zara Shahjahan, Afrozeh, Mushq, Qalamkar, Republic Womenswear and more at Fashion Palette.",
  alternates: { canonical: "/brands" },
};

export default async function BrandsPage() {
  const [allBrands, counts, editorPicks] = await Promise.all([
    // Active brands, alphabetical (Feedback 02).
    db.select().from(brands).where(eq(brands.isActive, true)).orderBy(brands.name),
    // Live published-product count per brand.
    db
      .select({ brandId: products.brandId, count: sql<number>`count(*)` })
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.publishStatus, "published"), gt(products.basePrice, "0")))
      .groupBy(products.brandId),
    // B1: Editor's Picks — manager-curated via the product "Featured" flag.
    db.query.products.findMany({
      where: and(
        eq(products.isFeatured, true),
        eq(products.isActive, true),
        eq(products.publishStatus, "published"),
        gt(products.basePrice, "0")
      ),
      with: { brand: true, images: true },
      orderBy: [desc(products.createdAt)],
      limit: 8,
    }),
  ]);

  const countByBrand = new Map(counts.map((c) => [c.brandId, Number(c.count)]));

  // B1: Featured Brands, ordered by the admin-set featured order then name.
  const featured = allBrands
    .filter((b) => b.isFeatured)
    .sort((a, b) => a.featuredSortOrder - b.featuredSortOrder || a.name.localeCompare(b.name));

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Brands" }]} className="mb-6" />

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">Brands</h1>
        <div className="w-10 h-[1px] bg-accent mt-3" />
        <p className="text-[13px] text-muted mt-4">
          {allBrands.length} designers · shop by house
        </p>
      </header>

      {/* Featured Brands */}
      {featured.length > 0 && (
        <section className="mb-16">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-primary mb-6">Featured Brands</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((brand) => {
              const count = countByBrand.get(brand.id) ?? 0;
              return (
                <Link
                  key={brand.slug}
                  href={`/brands/${brand.slug}`}
                  className="group relative overflow-hidden border border-border hover:border-accent hover:shadow-lg transition-all bg-surface/40"
                >
                  <div className="aspect-[16/9] flex items-center justify-center p-8">
                    {brand.logoUrl ? (
                      <Image
                        src={getImageUrl(brand.logoUrl)}
                        alt={brand.name}
                        width={200}
                        height={100}
                        className="max-h-24 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <span className="text-3xl font-light tracking-wide text-primary/70 group-hover:text-accent transition-colors">
                        {brand.name}
                      </span>
                    )}
                  </div>
                  <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between">
                    <h3 className="text-sm font-semibold group-hover:text-accent transition-colors">{brand.name}</h3>
                    <span className="text-[11px] text-muted">
                      {count > 0 ? `${count} ${count === 1 ? "product" : "products"}` : "Coming soon"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Editor's Picks */}
      {editorPicks.length > 0 && (
        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-primary">Editor&apos;s Picks</h2>
            <span className="text-[11px] text-muted">Hand-selected by our team</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {editorPicks.map((p) => (
              <ProductCard key={p.id} product={p as unknown as Product} />
            ))}
          </div>
        </section>
      )}

      {/* All Brands */}
      <section>
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-primary mb-6">All Brands</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {allBrands.map((brand) => {
            const count = countByBrand.get(brand.id) ?? 0;
            return (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group p-6 border border-border hover:border-accent hover:shadow-md transition-all text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center p-3">
                  {brand.logoUrl ? (
                    <Image
                      src={getImageUrl(brand.logoUrl)}
                      alt={brand.name}
                      width={60}
                      height={60}
                      className="object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-muted/50 group-hover:text-accent transition-colors">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold group-hover:text-accent transition-colors">{brand.name}</h3>
                <p className="text-xs text-muted mt-1">
                  {count > 0 ? `${count} ${count === 1 ? "product" : "products"}` : "Coming soon"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
