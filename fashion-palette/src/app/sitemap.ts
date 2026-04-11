import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${SITE_URL}/new-arrivals`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/sale`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/brands`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  // In production, fetch categories, brands, and products from DB
  const categories = ["unstitched", "ready-to-wear", "luxury-wear", "festive", "sale", "accessories"];
  const categoryPages = categories.map((slug) => ({
    url: `${SITE_URL}/categories/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const brands = ["gul-ahmed", "khaadi", "sana-safinaz", "maria-b", "sapphire", "limelight", "alkaram-studio", "baroque"];
  const brandPages = brands.map((slug) => ({
    url: `${SITE_URL}/brands/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...brandPages];
}
