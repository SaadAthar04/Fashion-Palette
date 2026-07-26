import { Metadata } from "next";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductGrid from "@/components/product/ProductGrid";

export const revalidate = 300; // ISR: cache 5 min (public catalog)

export const metadata: Metadata = {
  title: "New Arrivals",
  description:
    "Discover the latest arrivals in Pakistani women's fashion. Fresh collections from top designers at Fashion Palette.",
};

export default async function NewArrivalsPage() {
  const newProducts = await db.query.products.findMany({
    where: and(
      eq(products.isNewArrival, true),
      eq(products.isActive, true),
      eq(products.publishStatus, "published")
    ),
    with: {
      brand: true,
      images: true,
    },
    orderBy: [desc(products.createdAt)],
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "New Arrivals" }]} className="mb-6" />
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-light tracking-tight">
          New Arrivals
        </h1>
        <div className="w-10 h-[1px] bg-accent mt-3" />
        <p className="text-[13px] text-muted mt-3">
          The latest drops from Pakistan&apos;s top designers
        </p>
      </div>
      <ProductGrid products={newProducts as any[]} columns={4} />
    </div>
  );
}
