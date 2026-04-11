import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account/", "/cart", "/checkout"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
