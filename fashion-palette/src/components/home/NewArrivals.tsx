import Link from "next/link";
import Carousel from "@/components/ui/Carousel";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface NewArrivalsProps {
  products: Product[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
              Just Dropped
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] font-light mt-3 tracking-tight">
              New Arrivals
            </h2>
            <div className="w-12 h-[1px] bg-accent mt-4" />
          </div>
          <Link
            href="/new-arrivals"
            className="hidden md:inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary hover:text-accent transition-colors duration-300 border-b border-primary/20 hover:border-accent pb-1 group"
          >
            View All
            <svg
              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300"
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

        <Carousel slidesToShow={4} showArrows showDots={false}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Carousel>

        {/* Mobile View All */}
        <div className="mt-10 text-center md:hidden">
          <Link
            href="/new-arrivals"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary border-b border-primary/20 pb-1 hover:text-accent hover:border-accent transition-colors duration-300"
          >
            View All New Arrivals
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
