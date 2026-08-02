import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collections, brands, auditLog } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireCatalogueEditor } from "@/lib/admin";
import { slugify } from "@/lib/utils";

export async function GET() {
  const auth = await requireCatalogueEditor();
  if (auth.error) return auth.error;
  const rows = await db
    .select({
      id: collections.id, name: collections.name, slug: collections.slug, brandId: collections.brandId,
      brand: brands.name, season: collections.season, sortOrder: collections.sortOrder,
      isActive: collections.isActive, imageUrl: collections.imageUrl, sourceUrl: collections.sourceUrl,
    })
    .from(collections)
    .leftJoin(brands, eq(collections.brandId, brands.id))
    .orderBy(asc(collections.sortOrder), asc(collections.name));
  return NextResponse.json({ collections: rows });
}

const schema = z.object({
  name: z.string().min(1).max(255),
  brandId: z.coerce.number().int().positive(),
  slug: z.string().max(255).optional().or(z.literal("")),
  season: z.string().max(60).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const auth = await requireCatalogueEditor();
  if (auth.error) return auth.error;

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid collection details" }, { status: 400 });
  }

  const slug = (data.slug || slugify(data.name)).slice(0, 255);
  const [existing] = await db.select({ id: collections.id }).from(collections).where(eq(collections.slug, slug)).limit(1);
  if (existing) return NextResponse.json({ error: "A collection with this slug already exists." }, { status: 409 });

  const [res] = await db.insert(collections).values({
    name: data.name,
    brandId: data.brandId,
    slug,
    season: data.season || null,
    sortOrder: data.sortOrder,
    isActive: data.isActive,
    imageUrl: data.imageUrl || null,
  }).$returningId();

  await db.insert(auditLog).values({
    actorUserId: parseInt(auth.session.user.id),
    action: "collection.create", entityType: "collection", entityId: String(res.id), meta: { slug },
  });
  return NextResponse.json({ ok: true, id: res.id });
}
