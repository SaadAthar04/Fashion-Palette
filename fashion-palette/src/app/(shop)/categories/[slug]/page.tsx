import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { categories, brands, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import CategoryPageClient from "./CategoryPageClient";

export const revalidate = 300; // ISR: cache 5 min (public catalog)

type Props = {
  params: Promise<{ slug: string }>;
};

async function getCategoryData(slug: string) {
  const category = await db.query.categories.findFirst({
    where: and(eq(categories.slug, slug), eq(categories.isActive, true)),
  });

  if (!category) return null;

  const [categoryProducts, allBrands] = await Promise.all([
    db.query.products.findMany({
      // Feedback 11/22: only published, active products are public-facing.
      where: and(
        eq(products.categoryId, category.id),
        eq(products.isActive, true),
        eq(products.publishStatus, "published")
      ),
      with: {
        brand: true,
        images: true,
      },
    }),
    db
      .select()
      .from(brands)
      .where(eq(brands.isActive, true))
      .orderBy(brands.name),
  ]);

  return { category, products: categoryProducts, brands: allBrands };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${data.category.name} — Shop Pakistani Fashion`,
    description: `Browse our ${data.category.name.toLowerCase()} collection. Shop the latest Pakistani fashion from top designers at Fashion Palette.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) {
    notFound();
  }

  return (
    <CategoryPageClient
      slug={slug}
      categoryName={data.category.name}
      categoryIntro={data.category.description ?? undefined}
      products={data.products as any[]}
      brands={data.brands}
    />
  );
}
