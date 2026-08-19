import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products, reviews, users } from "@/lib/db/schema";
import { eq, and, ne, desc, gt, or } from "drizzle-orm";
import ProductDetailClient from "./ProductDetailClient";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 300; // ISR: cache 5 min (public catalog)

type Props = {
  params: Promise<{ slug: string }>;
};

const sizeGuide = [
  { size: "S", bust: "34", waist: "28", hip: "36", length: "42" },
  { size: "M", bust: "36", waist: "30", hip: "38", length: "43" },
  { size: "L", bust: "38", waist: "32", hip: "40", length: "44" },
  { size: "XL", bust: "40", waist: "34", hip: "42", length: "45" },
];

async function getProduct(slug: string) {
  const product = await db.query.products.findFirst({
    // Feedback 22: draft products must not be publicly reachable by URL.
    // Final feedback A1: defence-in-depth — never surface (or allow adding to
    // cart) a product with a zero/invalid price, even if somehow published.
    where: and(
      eq(products.slug, slug),
      eq(products.isActive, true),
      eq(products.publishStatus, "published"),
      gt(products.basePrice, "0")
    ),
    with: {
      brand: true,
      category: true,
      images: true,
      variants: true,
    },
  });
  return product;
}

async function getProductReviews(productId: number) {
  const productReviews = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      userId: reviews.userId,
      rating: reviews.rating,
      comment: reviews.comment,
      isApproved: reviews.isApproved,
      createdAt: reviews.createdAt,
      userName: users.name,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt));

  return productReviews.map((r) => ({
    id: r.id,
    productId: r.productId,
    userId: r.userId,
    rating: r.rating,
    comment: r.comment,
    isApproved: r.isApproved,
    createdAt: r.createdAt,
    user: { name: r.userName || "Customer" },
  }));
}

// Final feedback A4: recommend by relevant attributes (same brand, collection,
// fabric, category or price range) rather than category alone.
async function getRelatedProducts(current: {
  id: number;
  categoryId: number;
  brandId: number;
  collectionId: number | null;
  fabric: string | null;
  basePrice: string;
}) {
  // Candidate pool: same category, brand or collection (a wider net than category).
  const candidates = await db.query.products.findMany({
    where: and(
      eq(products.isActive, true),
      eq(products.publishStatus, "published"),
      gt(products.basePrice, "0"),
      ne(products.id, current.id),
      or(
        eq(products.categoryId, current.categoryId),
        eq(products.brandId, current.brandId),
        current.collectionId ? eq(products.collectionId, current.collectionId) : undefined
      )
    ),
    with: { brand: true, images: true },
    limit: 40,
  });

  const basePrice = parseFloat(current.basePrice) || 0;
  const scored = candidates
    .map((p) => {
      let score = 0;
      if (current.collectionId && p.collectionId === current.collectionId) score += 5;
      if (p.brandId === current.brandId) score += 4;
      if (p.categoryId === current.categoryId) score += 3;
      if (current.fabric && p.fabric && p.fabric.toLowerCase() === current.fabric.toLowerCase()) score += 2;
      // Price proximity (within 30% of the current price).
      const price = parseFloat(p.basePrice) || 0;
      if (basePrice > 0 && Math.abs(price - basePrice) <= basePrice * 0.3) score += 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 4).map((s) => s.p);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const primaryImage = product.images?.find((img) => img.isPrimary);
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || "",
    openGraph: {
      title: product.name,
      description: product.shortDescription || "",
      images: primaryImage
        ? [{ url: primaryImage.imageUrl, alt: product.name }]
        : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const [productReviews, relatedProducts] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts({
      id: product.id,
      categoryId: product.categoryId,
      brandId: product.brandId,
      collectionId: product.collectionId,
      fabric: product.fabric,
      basePrice: product.basePrice,
    }),
  ]);

  const avgRating =
    productReviews.length > 0
      ? productReviews.reduce((sum, r) => sum + r.rating, 0) /
        productReviews.length
      : 0;

  return (
    <>
      <ProductJsonLd
        product={product as any}
        reviewCount={productReviews.length}
        avgRating={avgRating}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          {
            name: product.brand?.name || "Brand",
            href: `/brands/${product.brand?.slug || ""}`,
          },
          { name: product.name, href: `/products/${product.slug}` },
        ]}
      />
      <ProductDetailClient
        product={product as any}
        reviews={productReviews}
        relatedProducts={relatedProducts as any[]}
        sizeGuide={sizeGuide}
      />
    </>
  );
}
