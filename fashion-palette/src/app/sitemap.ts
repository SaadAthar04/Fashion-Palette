import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { products, brands, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";

// Feedback 30: dynamic sitemap from real, published data (no dead links).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${SITE_URL}/new-arrivals`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/sale`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${SITE_URL}/brands`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${SITE_URL}/shipping`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${SITE_URL}/returns`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${SITE_URL}/payment`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const [cats, brs, prods] = await Promise.all([
    db.select({ slug: categories.slug }).from(categories).where(eq(categories.isActive, true)),
    db.select({ slug: brands.slug }).from(brands).where(eq(brands.isActive, true)),
    db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.publishStatus, "published"))),
  ]);

  const categoryPages = cats.map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const brandPages = brs.map((b) => ({
    url: `${SITE_URL}/brands/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productPages = prods.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...brandPages, ...productPages];
}
