import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collections, products, auditLog } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { z } from "zod";
import { requireCatalogueEditor } from "@/lib/admin";

const schema = z.object({
  name: z.string().min(1).max(255).optional(),
  brandId: z.coerce.number().int().positive().optional(),
  season: z.string().max(60).nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCatalogueEditor();
  if (auth.error) return auth.error;
  const { id } = await params;

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }
  const update: Record<string, unknown> = {};
  for (const k of ["name", "brandId", "season", "sortOrder", "isActive", "imageUrl"] as const) {
    if (data[k] !== undefined) update[k] = data[k];
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  await db.update(collections).set(update).where(eq(collections.id, parseInt(id)));
  await db.insert(auditLog).values({
    actorUserId: parseInt(auth.session.user.id),
    action: "collection.update", entityType: "collection", entityId: id, meta: update,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCatalogueEditor();
  if (auth.error) return auth.error;
  const { id } = await params;

  // Don't orphan products — block delete if any product is still in it.
  const [{ c }] = await db.select({ c: count() }).from(products).where(eq(products.collectionId, parseInt(id)));
  if (c > 0) {
    return NextResponse.json({ error: `${c} product(s) still use this collection. Reassign them first, or hide the collection instead.` }, { status: 409 });
  }
  await db.delete(collections).where(eq(collections.id, parseInt(id)));
  await db.insert(auditLog).values({
    actorUserId: parseInt(auth.session.user.id),
    action: "collection.delete", entityType: "collection", entityId: id,
  });
  return NextResponse.json({ ok: true });
}
