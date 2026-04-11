import { Metadata } from "next";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductGrid from "@/components/product/ProductGrid";
import SaleBanner from "@/components/home/SaleBanner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sale",
  description:
    "Shop amazing deals and discounts on Pakistani fashion. Up to 50% off on selected collections at Fashion Palette.",
};

export default async function SalePage() {
  const saleProducts = await db.query.products.findMany({
    where: and(
      isNotNull(products.salePrice),
      eq(products.isActive, true)
    ),
    with: {
      brand: true,
      images: true,
    },
  });

  return (
    <>
      <SaleBanner />
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <Breadcrumb items={[{ label: "Sale" }]} className="mb-6" />
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-light tracking-tight">
            Sale Collection
          </h1>
          <div className="w-10 h-[1px] bg-accent mt-3" />
          <p className="text-[13px] text-muted mt-3">
            Incredible deals on your favorite brands
          </p>
        </div>
        <ProductGrid products={saleProducts as any[]} columns={4} />
      </div>
    </>
  );
}
