import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and, isNotNull, gt } from "drizzle-orm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductGrid from "@/components/product/ProductGrid";

export const revalidate = 300; // ISR: cache 5 min (public catalog)

export const metadata: Metadata = {
  title: "Sale",
  description: "Shop current discounts on Pakistani designer fashion at Fashion Palette.",
};

export default async function SalePage() {
  // Feedback 24: no reset-every-visit countdown banner. Only genuinely
  // discounted, published products appear here.
  const saleProducts = await db.query.products.findMany({
    where: and(
      isNotNull(products.salePrice),
      eq(products.isActive, true),
      eq(products.publishStatus, "published"),
      gt(products.basePrice, "0")
    ),
    with: { brand: true, images: true },
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Sale" }]} className="mb-6" />
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-light tracking-tight">Sale</h1>
        <div className="w-10 h-[1px] bg-accent mt-3" />
        <p className="text-[13px] text-muted mt-3">
          {saleProducts.length > 0
            ? `${saleProducts.length} discounted ${saleProducts.length === 1 ? "piece" : "pieces"}`
            : "Current markdowns"}
        </p>
      </div>

      {saleProducts.length > 0 ? (
        <ProductGrid products={saleProducts as any[]} columns={4} />
      ) : (
        <div className="border border-border/60 bg-surface/50 py-16 px-6 text-center">
          <p className="text-sm font-medium">No active sale right now.</p>
          <p className="text-[13px] text-muted mt-2">
            Check back soon — or explore the latest arrivals.
          </p>
          <Link
            href="/new-arrivals"
            className="inline-block mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent hover:text-accent-hover"
          >
            Shop New Arrivals →
          </Link>
        </div>
      )}
    </div>
  );
}
