import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brands, products } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { brandSchema } from "@/lib/validators";

export async function GET() {
  const result = await db
    .select({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
      logoUrl: brands.logoUrl,
      description: brands.description,
      isActive: brands.isActive,
      sortOrder: brands.sortOrder,
      createdAt: brands.createdAt,
      productCount: count(products.id),
    })
    .from(brands)
    .leftJoin(products, eq(products.brandId, brands.id))
    .groupBy(brands.id)
    .orderBy(brands.sortOrder);

  return NextResponse.json({ brands: result });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const data = brandSchema.parse(body);

    const [result] = await db.insert(brands).values(data).$returningId();

    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, result.id),
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid brand data" }, { status: 400 });
    }
    console.error("Create brand error:", error);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
