import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { products, productImages, productVariants, auditLog } from "@/lib/db/schema";
import { eq, and, or, like, desc, asc, sql, count } from "drizzle-orm";
import { requireCatalogueEditor } from "@/lib/admin";
import { productSchema } from "@/lib/validators";
import { revalidateCatalog } from "@/lib/revalidate";

const STAFF_ROLES = ["admin", "catalogue_editor", "order_manager"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const search = searchParams.get("q");
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const offset = (page - 1) * limit;

  // Feedback 01: only staff may see drafts/inactive via this endpoint (feeds).
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role ?? "guest";
  const isStaff = STAFF_ROLES.includes(role);

  const conditions = [];
  if (!isStaff) {
    conditions.push(eq(products.isActive, true));
    conditions.push(eq(products.publishStatus, "published"));
  }
  if (category) conditions.push(eq(products.categoryId, parseInt(category)));
  if (brand) conditions.push(eq(products.brandId, parseInt(brand)));
  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(
        like(products.name, term),
        like(products.sku, term),
        like(products.shortDescription, term)
      )!
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy =
    sort === "price-asc" ? asc(products.basePrice) :
    sort === "price-desc" ? desc(products.basePrice) :
    sort === "name" ? asc(products.name) :
    desc(products.createdAt);

  const [items, [{ total }]] = await Promise.all([
    db.query.products.findMany({
      where,
      with: { brand: true, category: true, images: true },
      orderBy: () => [orderBy],
      limit,
      offset,
    }),
    db.select({ total: count() }).from(products).where(where),
  ]);

  return NextResponse.json({
    products: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireCatalogueEditor();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const data = productSchema.parse(body);
    const { ...productData } = data;

    const [result] = await db.insert(products).values(productData).$returningId();
    const productId = result.id;

    await db.insert(auditLog).values({
      actorUserId: parseInt(auth.session.user.id),
      action: "product.create",
      entityType: "product",
      entityId: String(productId),
    });

    // Insert images if provided
    if (body.images?.length) {
      await db.insert(productImages).values(
        body.images.map((img: { imageUrl: string; altText?: string; sortOrder?: number; isPrimary?: boolean }, i: number) => ({
          productId,
          imageUrl: img.imageUrl,
          altText: img.altText || null,
          sortOrder: img.sortOrder ?? i,
          isPrimary: img.isPrimary ?? i === 0,
        }))
      );
    }

    // Insert variants if provided
    if (body.variants?.length) {
      await db.insert(productVariants).values(
        body.variants.map((v: { size?: string; color?: string; colorHex?: string; stockQuantity?: number; priceAdjustment?: string; skuSuffix?: string }) => ({
          productId,
          size: v.size || null,
          color: v.color || null,
          colorHex: v.colorHex || null,
          stockQuantity: v.stockQuantity ?? 0,
          priceAdjustment: v.priceAdjustment || "0.00",
          skuSuffix: v.skuSuffix || null,
        }))
      );
    }

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { brand: true, category: true, images: true, variants: true },
    });

    revalidateCatalog();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
