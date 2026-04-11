"use client";

import Link from "next/link";
import CountdownTimer from "@/components/shared/CountdownTimer";

export default function SaleBanner() {
  const saleEnd = new Date();
  saleEnd.setDate(saleEnd.getDate() + 7);

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="relative bg-primary overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-accent/[0.08] to-transparent" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-accent/[0.04] to-transparent" />
            {/* Subtle geometric lines */}
            <div className="absolute top-8 right-8 w-32 h-32 border border-white/[0.04] rotate-45" />
            <div className="absolute bottom-8 left-8 w-24 h-24 border border-white/[0.04] rotate-12" />
          </div>

          <div className="relative px-6 py-16 md:px-16 md:py-20 text-center text-white">
            <span className="inline-block text-accent text-[10px] font-semibold uppercase tracking-[0.3em] mb-5">
              Limited Time Offer
            </span>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-4">
              Flat{" "}
              <span className="text-gold-gradient font-semibold">30% OFF</span>
            </h2>

            <p className="text-white/40 text-sm md:text-base mb-10 max-w-md mx-auto tracking-wide font-light">
              On selected luxury &amp; festive collections.
              Don&apos;t miss these incredible deals.
            </p>

            <div className="flex justify-center mb-10">
              <CountdownTimer targetDate={saleEnd} />
            </div>

            <Link
              href="/sale"
              className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white border border-white/20 px-10 py-4 hover:bg-accent hover:border-accent transition-all duration-500"
            >
              Shop Sale
              <svg
                className="w-4 h-4"
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
      </div>
    </section>
  );
}
