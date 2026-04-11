"use client";

import Image from "next/image";
import Link from "next/link";
import Carousel from "@/components/ui/Carousel";
import type { Banner } from "@/types";

interface HeroBannerProps {
  banners: Banner[];
}

const fallbackBanners: Banner[] = [
  {
    id: 1,
    title: "New Spring Collection",
    subtitle: "Discover the latest trends in Pakistani fashion",
    imageUrl: "/images/banners/hero-1.jpg",
    mobileImageUrl: "/images/banners/hero-1-mobile.jpg",
    linkUrl: "/new-arrivals",
    ctaText: "Shop Now",
    sortOrder: 1,
    isActive: true,
    startsAt: null,
    endsAt: null,
  },
  {
    id: 2,
    title: "Flat 30% Off",
    subtitle: "On selected luxury & festive collections",
    imageUrl: "/images/banners/hero-2.jpg",
    mobileImageUrl: "/images/banners/hero-2-mobile.jpg",
    linkUrl: "/sale",
    ctaText: "Shop Sale",
    sortOrder: 2,
    isActive: true,
    startsAt: null,
    endsAt: null,
  },
  {
    id: 3,
    title: "Wedding Season",
    subtitle: "Explore our exclusive bridal & formal wear",
    imageUrl: "/images/banners/hero-3.jpg",
    mobileImageUrl: "/images/banners/hero-3-mobile.jpg",
    linkUrl: "/categories/luxury-wear",
    ctaText: "Explore Collection",
    sortOrder: 3,
    isActive: true,
    startsAt: null,
    endsAt: null,
  },
];

export default function HeroBanner({ banners }: HeroBannerProps) {
  const slides = banners.length > 0 ? banners : fallbackBanners;

  return (
    <section className="relative">
      <Carousel autoPlay autoPlayInterval={5000} showDots showArrows={false}>
        {slides.map((banner, index) => (
          <div
            key={banner.id}
            className="relative w-full aspect-[16/7] md:aspect-[16/6] bg-primary/5"
          >
            {/* Desktop Image */}
            <Image
              src={banner.imageUrl}
              alt={banner.title || "Fashion Palette"}
              fill
              className="object-cover hidden md:block"
              priority={index === 0}
              sizes="100vw"
            />
            {/* Mobile Image */}
            <Image
              src={banner.mobileImageUrl || banner.imageUrl}
              alt={banner.title || "Fashion Palette"}
              fill
              className="object-cover md:hidden"
              priority={index === 0}
              sizes="100vw"
            />

            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 w-full">
                <div className="max-w-xl">
                  {/* Decorative accent line */}
                  <div className="w-12 h-[2px] bg-accent mb-6 md:mb-8" />

                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-white leading-[1.1] tracking-tight">
                    {banner.title}
                  </h2>

                  {banner.subtitle && (
                    <p className="text-sm md:text-base text-white/60 mt-4 md:mt-6 tracking-wide leading-relaxed max-w-md font-light">
                      {banner.subtitle}
                    </p>
                  )}

                  {banner.linkUrl && (
                    <Link
                      href={banner.linkUrl}
                      className="inline-flex items-center gap-3 mt-8 md:mt-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-white border-b border-white/30 pb-1.5 hover:border-accent hover:text-accent transition-all duration-500 group"
                    >
                      {banner.ctaText || "Shop Now"}
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
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
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
}
