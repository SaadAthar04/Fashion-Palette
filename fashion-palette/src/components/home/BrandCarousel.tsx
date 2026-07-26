"use client";

import Link from "next/link";
import Image from "next/image";
import Carousel from "@/components/ui/Carousel";
import { getImageUrl } from "@/lib/utils";

export interface BrandCard {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

interface BrandCarouselProps {
  brands: BrandCard[];
}

export default function BrandCarousel({ brands }: BrandCarouselProps) {
  if (!brands.length) return null;

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-surface/40">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">Trusted Names</span>
          <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] font-light mt-3 tracking-tight">Shop by Brand</h2>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
        </div>

        <Carousel slidesToShow={5} showArrows showDots={false} loop>
          {brands.map((brand) => (
            <Link key={brand.slug} href={`/brands/${brand.slug}`} className="block px-2 group">
              <div className="relative aspect-[3/4] overflow-hidden bg-white">
                {brand.image ? (
                  <Image
                    src={getImageUrl(brand.image)}
                    alt={brand.name}
                    fill
                    loading="lazy"
                    className="object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface">
                    <span className="text-2xl font-light text-muted/40">{brand.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="text-center text-[12px] font-medium tracking-[0.08em] mt-3 group-hover:text-accent transition-colors">
                {brand.name}
              </p>
            </Link>
          ))}
        </Carousel>

        <div className="text-center mt-10">
          <Link href="/brands" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent hover:text-accent-hover">
            View all brands →
          </Link>
        </div>
      </div>
    </section>
  );
}
