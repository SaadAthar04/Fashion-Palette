"use client";

import Image from "next/image";
import Link from "next/link";
import Carousel from "@/components/ui/Carousel";
import { getImageUrl } from "@/lib/utils";

export interface HeroSlide {
  slug: string;
  name: string;
  brand: string;
  image: string;
}

interface HeroBannerProps {
  slides: HeroSlide[];
}

export default function HeroBanner({ slides }: HeroBannerProps) {
  // Graceful branded fallback if the catalogue has no imagery yet.
  if (!slides || slides.length === 0) {
    return (
      <section className="relative bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-24 md:py-32 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">Fashion Palette</span>
          <h1 className="text-3xl md:text-5xl font-light tracking-tight mt-4">Pakistan&rsquo;s Designer Wardrobe</h1>
          <p className="text-[13px] md:text-sm text-muted mt-4 max-w-md mx-auto">
            Unstitched, prints, embroidered & festive from the houses you love.
          </p>
          <Link href="/new-arrivals" className="inline-block mt-8 bg-primary text-white px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-accent transition-colors">
            Shop New Arrivals
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <Carousel autoPlay autoPlayInterval={5000} showDots showArrows={false}>
        {slides.map((slide, index) => (
          <Link
            key={slide.slug}
            href={`/products/${slide.slug}`}
            className="relative block w-full aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/7] bg-surface overflow-hidden group"
          >
            <Image
              src={getImageUrl(slide.image)}
              alt={slide.name}
              fill
              className="object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              sizes="100vw"
            />
            {/* Editorial gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            <div className="absolute inset-0 flex items-end md:items-center">
              <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 w-full pb-10 md:pb-0">
                <div className="max-w-xl">
                  <div className="w-12 h-[2px] bg-accent mb-5 md:mb-7" />
                  {slide.brand && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">
                      {slide.brand}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-light text-white leading-[1.12] tracking-tight mt-3 line-clamp-2">
                    New Arrivals 2026
                  </h2>
                  <p className="text-[13px] md:text-sm text-white/70 mt-3 md:mt-4 tracking-wide font-light max-w-md line-clamp-1">
                    {slide.name}
                  </p>
                  <span className="inline-flex items-center gap-3 mt-6 md:mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-white border-b border-white/40 pb-1.5 group-hover:border-accent group-hover:text-accent transition-all duration-500">
                    Shop the look
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </Carousel>
    </section>
  );
}
