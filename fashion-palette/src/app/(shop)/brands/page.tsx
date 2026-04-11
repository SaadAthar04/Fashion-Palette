import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getImageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Brands",
  description:
    "Shop from Pakistan's top fashion brands including Gul Ahmed, Khaadi, Sana Safinaz, Maria B, Sapphire, and more at Fashion Palette.",
};

export default async function BrandsPage() {
  const allBrands = await db
    .select()
    .from(brands)
    .where(eq(brands.isActive, true))
    .orderBy(brands.sortOrder);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Brands" }]} className="mb-6" />
      <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-8">
        All Brands
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {allBrands.map((brand) => (
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
            {brand.description && (
              <p className="text-xs text-muted mt-1 line-clamp-2">
                {brand.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
