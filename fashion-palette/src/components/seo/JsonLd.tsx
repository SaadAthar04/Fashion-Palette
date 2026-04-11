import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";
import type { Product } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.png`,
        sameAs: [
          SOCIAL_LINKS.facebook,
          SOCIAL_LINKS.instagram,
          SOCIAL_LINKS.tiktok,
          SOCIAL_LINKS.youtube,
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+92-327-679-6087",
          contactType: "customer service",
          availableLanguage: ["English", "Urdu"],
        },
      }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function ProductJsonLd({ product, reviewCount, avgRating }: {
  product: Product;
  reviewCount?: number;
  avgRating?: number;
}) {
  const price = product.salePrice ?? product.basePrice;
  const primaryImage = product.images?.find((img) => img.isPrimary);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description || "",
    image: primaryImage ? `${SITE_URL}${primaryImage.imageUrl}` : undefined,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand?.name || "",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "PKR",
      price: parseFloat(price),
      availability: product.stockQuantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };

  if (reviewCount && avgRating) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return <JsonLdScript data={data} />;
}

export function BreadcrumbJsonLd({ items }: {
  items: { name: string; href: string }[];
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${SITE_URL}${item.href}`,
        })),
      }}
    />
  );
}

export function FAQJsonLd({ questions }: {
  questions: { question: string; answer: string }[];
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      }}
    />
  );
}
