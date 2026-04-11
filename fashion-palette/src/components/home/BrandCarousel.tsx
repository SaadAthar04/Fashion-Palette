"use client";

import Link from "next/link";
import Image from "next/image";
import Carousel from "@/components/ui/Carousel";
import type { Brand } from "@/types";

interface BrandCarouselProps {
  brands: Brand[];
}

const fallbackBrands = [
  {
    name: "Gul Ahmed",
    slug: "gul-ahmed",
    logoUrl: "/images/brands/gul-ahmed.png",
  },
  { name: "Khaadi", slug: "khaadi", logoUrl: "/images/brands/khaadi.png" },
  {
    name: "Sana Safinaz",
    slug: "sana-safinaz",
    logoUrl: "/images/brands/sana-safinaz.png",
  },
  { name: "Maria B", slug: "maria-b", logoUrl: "/images/brands/maria-b.png" },
  {
    name: "Sapphire",
    slug: "sapphire",
    logoUrl: "/images/brands/sapphire.png",
  },
  {
    name: "Limelight",
    slug: "limelight",
    logoUrl: "/images/brands/limelight.png",
  },
  {
    name: "Alkaram Studio",
    slug: "alkaram-studio",
    logoUrl: "/images/brands/alkaram.png",
  },
  { name: "Baroque", slug: "baroque", logoUrl: "/images/brands/baroque.png" },
];

export default function BrandCarousel({ brands }: BrandCarouselProps) {
  const items =
    brands.length > 0
      ? brands.map((b) => ({
          name: b.name,
          slug: b.slug,
          logoUrl: b.logoUrl,
        }))
      : fallbackBrands;

  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
            Trusted Names
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] font-light mt-3 tracking-tight">
            Shop by Brand
          </h2>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
        </div>

        <Carousel slidesToShow={6} showArrows showDots={false} loop>
          {items.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="flex flex-col items-center gap-4 py-4 group"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 bg-surface border border-border/50 flex items-center justify-center p-5 group-hover:border-accent/40 group-hover:bg-white transition-all duration-400">
                <Image
                  src={brand.logoUrl || "/images/placeholder/brand.png"}
                  alt={brand.name}
                  width={80}
                  height={80}
                  className="object-contain opacity-50 group-hover:opacity-90 transition-opacity duration-400"
                />
              </div>
              <span className="text-[11px] font-medium tracking-[0.1em] text-muted text-center group-hover:text-accent transition-colors duration-300">
                {brand.name}
              </span>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
