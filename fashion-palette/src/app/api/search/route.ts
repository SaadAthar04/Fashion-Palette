import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and, or, like } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json([]);
  }

  const searchTerm = `%${query}%`;

  const results = await db.query.products.findMany({
    where: and(
      eq(products.isActive, true),
      or(
        like(products.name, searchTerm),
        like(products.shortDescription, searchTerm),
        like(products.fabric, searchTerm),
        like(products.occasion, searchTerm),
        like(products.sku, searchTerm)
      )
    ),
    with: {
      brand: true,
      images: true,
    },
    limit: 20,
  });

  return NextResponse.json(results);
}
