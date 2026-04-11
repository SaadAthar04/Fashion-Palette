import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { categorySchema } from "@/lib/validators";

export async function GET() {
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      imageUrl: categories.imageUrl,
      parentId: categories.parentId,
      isActive: categories.isActive,
      sortOrder: categories.sortOrder,
      createdAt: categories.createdAt,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.sortOrder);

  return NextResponse.json({ categories: result });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const data = categorySchema.parse(body);

    const [result] = await db.insert(categories).values(data).$returningId();

    const category = await db.query.categories.findFirst({
      where: eq(categories.id, result.id),
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid category data" }, { status: 400 });
    }
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
