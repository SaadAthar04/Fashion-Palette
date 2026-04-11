import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import type { Product } from "@/types";

interface BestSellersProps {
  products: Product[];
}

export default function BestSellers({ products }: BestSellersProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
            Customer Favourites
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] font-light mt-3 tracking-tight">
            Best Sellers
          </h2>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
        </div>

        <ProductGrid products={products.slice(0, 8)} columns={4} />

        <div className="mt-12 text-center">
          <Link
            href="/new-arrivals"
            className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary border border-primary/20 px-8 py-3.5 hover:bg-primary hover:text-white transition-all duration-400"
          >
            View All Products
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
