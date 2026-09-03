import Link from "next/link";
import { getImageUrl } from "@/lib/utils";

export type PromoBannerData = {
  id: number;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  ctaText: string | null;
  couponCode: string | null;
};

// Phase 2 B2: admin-configurable homepage promotional banner. Responsive imagery
// (separate mobile image when provided), readable text overlay, and an optional
// coupon chip. Essential copy is real text (not baked only into the image) for
// accessibility and contrast. Renders nothing when there is no active banner.
export default function PromoBanner({ banner }: { banner: PromoBannerData | null }) {
  if (!banner) return null;

  const desktop = getImageUrl(banner.imageUrl);
  const mobile = banner.mobileImageUrl ? getImageUrl(banner.mobileImageUrl) : desktop;
  const hasText = Boolean(banner.title || banner.subtitle || banner.ctaText);

  const inner = (
    <div className="relative overflow-hidden rounded-sm">
      <picture>
        <source media="(max-width: 640px)" srcSet={mobile} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={desktop}
          alt={banner.title || "Promotion"}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </picture>
      {hasText && (
        <div className="absolute inset-0 flex flex-col items-start justify-center gap-2 bg-gradient-to-r from-black/45 via-black/15 to-transparent px-6 md:px-12">
          {banner.title && (
            <h2 className="text-white text-lg md:text-3xl font-semibold tracking-tight max-w-lg drop-shadow-sm">
              {banner.title}
            </h2>
          )}
          {banner.subtitle && (
            <p className="text-white/90 text-[12px] md:text-base max-w-md drop-shadow-sm">{banner.subtitle}</p>
          )}
          <div className="flex items-center gap-3 mt-1">
            {banner.ctaText && (
              <span className="inline-block bg-white text-primary text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.15em] px-5 py-2.5">
                {banner.ctaText}
              </span>
            )}
            {banner.couponCode && (
              <span className="inline-block border border-white/70 text-white text-[11px] md:text-[12px] font-semibold tracking-[0.15em] px-4 py-2">
                Code: {banner.couponCode}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 my-8 md:my-12">
      {banner.linkUrl ? (
        <Link href={banner.linkUrl} className="block group">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </section>
  );
}
