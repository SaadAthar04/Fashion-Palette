import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { brands, products } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getImageUrl } from "@/lib/utils";

export const revalidate = 300; // ISR: cache 5 min (public catalog)

export const metadata: Metadata = {
  title: "All Brands",
  description:
    "Shop leading Pakistani designers — Maria B, Elan, Zara Shahjahan, Afrozeh, Mushq, Qalamkar, Republic Womenswear and more at Fashion Palette.",
};

export default async function BrandsPage() {
  // Alphabetical, active brands only (Feedback 02).
  const allBrands = await db
    .select()
    .from(brands)
    .where(eq(brands.isActive, true))
    .orderBy(brands.name);

  // Live published-product count per brand (Feedback 02: product count).
  const counts = await db
    .select({ brandId: products.brandId, count: sql<number>`count(*)` })
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.publishStatus, "published")))
    .groupBy(products.brandId);
  const countByBrand = new Map(counts.map((c) => [c.brandId, Number(c.count)]));

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Brands" }]} className="mb-6" />
      <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2">All Brands</h1>
      <p className="text-[13px] text-muted mb-8">
        {allBrands.length} designers · shop by house
      </p>

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
              <h3 className="text-sm font-semibold group-hover:text-accent transition-colors">
                {brand.name}
              </h3>
              <p className="text-xs text-muted mt-1">
                {count > 0 ? `${count} ${count === 1 ? "product" : "products"}` : "Coming soon"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
