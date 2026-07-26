import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products, reviews, users } from "@/lib/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import ProductDetailClient from "./ProductDetailClient";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

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
    where: and(
      eq(products.slug, slug),
      eq(products.isActive, true),
      eq(products.publishStatus, "published")
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

async function getRelatedProducts(productId: number, categoryId: number) {
  const related = await db.query.products.findMany({
    where: and(
      eq(products.categoryId, categoryId),
      eq(products.isActive, true),
      eq(products.publishStatus, "published"),
      ne(products.id, productId)
    ),
    with: {
      brand: true,
      images: true,
    },
    limit: 4,
  });
  return related;
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
    getRelatedProducts(product.id, product.categoryId),
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
