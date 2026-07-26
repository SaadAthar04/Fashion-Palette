import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { brands, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductGrid from "@/components/product/ProductGrid";

export const revalidate = 300; // ISR: cache 5 min (public catalog)

type Props = {
  params: Promise<{ slug: string }>;
};

async function getBrandWithProducts(slug: string) {
  const brand = await db.query.brands.findFirst({
    where: and(eq(brands.slug, slug), eq(brands.isActive, true)),
  });

  if (!brand) return null;

  const brandProducts = await db.query.products.findMany({
    // Feedback 11/22: only published, active products are public-facing.
    where: and(
      eq(products.brandId, brand.id),
      eq(products.isActive, true),
      eq(products.publishStatus, "published")
    ),
    with: {
      brand: true,
      images: true,
    },
  });

  return { brand, products: brandProducts };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBrandWithProducts(slug);

  if (!data) {
    return { title: "Brand Not Found" };
  }

  return {
    title: `${data.brand.name} — Shop Collection`,
    description: `Browse the complete ${data.brand.name} collection at Fashion Palette. Authentic products with free delivery.`,
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const data = await getBrandWithProducts(slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb
        items={[
          { label: "Brands", href: "/brands" },
          { label: data.brand.name },
        ]}
        className="mb-6"
      />

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-light tracking-tight">
          {data.brand.name}
        </h1>
        <div className="w-10 h-[1px] bg-accent mt-3" />
        <p className="text-[13px] text-muted mt-3">
          {data.products.length} {data.products.length === 1 ? "product" : "products"}
        </p>
      </div>

      {data.products.length > 0 ? (
        <ProductGrid products={data.products as any[]} columns={4} />
      ) : (
        <div className="border border-border/60 bg-surface/50 py-16 px-6 text-center">
          <p className="text-sm font-medium">New arrivals from {data.brand.name} are on their way.</p>
          <p className="text-[13px] text-muted mt-2">
            This collection is being added. Explore other designers in the meantime.
          </p>
          <Link
            href="/brands"
            className="inline-block mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent hover:text-accent-hover"
          >
            Browse all brands →
          </Link>
        </div>
      )}
    </div>
  );
}
