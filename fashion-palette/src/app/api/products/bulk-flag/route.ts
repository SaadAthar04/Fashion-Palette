import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, auditLog } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { requireCatalogueEditor } from "@/lib/admin";
import { revalidateCatalog } from "@/lib/revalidate";

// Phase 2 A1: bulk-toggle a merchandising flag on selected products. Used mainly
// to curate New Arrivals (mark/unmark many products at once) so the section is a
// deliberate selection, not the whole imported catalogue.
// Body: { ids: number[], flag: "isNewArrival"|"isFeatured"|"isBestSeller", value: boolean }
const ALLOWED_FLAGS = ["isNewArrival", "isFeatured", "isBestSeller"] as const;
type Flag = (typeof ALLOWED_FLAGS)[number];

export async function POST(req: NextRequest) {
  const auth = await requireCatalogueEditor();
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const flag = body.flag as Flag;
    if (!ALLOWED_FLAGS.includes(flag)) {
      return NextResponse.json({ error: "Invalid flag" }, { status: 400 });
    }
    const ids = Array.isArray(body.ids)
      ? body.ids.map((n: unknown) => Number(n)).filter((n: number) => Number.isFinite(n))
      : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: "Provide ids[]" }, { status: 400 });
    }
    const value = Boolean(body.value);

    const res = await db.update(products).set({ [flag]: value }).where(inArray(products.id, ids));
    const affected = (res as unknown as [{ affectedRows?: number }])[0]?.affectedRows ?? ids.length;

    await db.insert(auditLog).values({
      actorUserId: parseInt(auth.session.user.id),
      action: "product.bulk_flag",
      entityType: "product",
      meta: { flag, value, affected, ids },
    });

    revalidateCatalog();
    return NextResponse.json({ ok: true, affected, flag, value });
  } catch (error) {
    console.error("Bulk flag error:", error);
    return NextResponse.json({ error: "Bulk update failed" }, { status: 500 });
  }
}
