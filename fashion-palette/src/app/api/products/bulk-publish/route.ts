import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, auditLog } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { requireCatalogueEditor } from "@/lib/admin";

// Feedback 22: bulk publish/unpublish. Body: { status: "published"|"draft",
// all?: true (all drafts→published or all→draft), ids?: number[] }.
export async function POST(req: NextRequest) {
  const auth = await requireCatalogueEditor();
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const target = body.status === "draft" ? "draft" : "published";

    let affected = 0;
    if (Array.isArray(body.ids) && body.ids.length) {
      const ids = body.ids.map((n: unknown) => Number(n)).filter((n: number) => Number.isFinite(n));
      const res = await db.update(products).set({ publishStatus: target }).where(inArray(products.id, ids));
      affected = (res as unknown as { affectedRows?: number }).affectedRows ?? ids.length;
    } else if (body.all) {
      // Flip everything currently in the opposite state.
      const from = target === "published" ? "draft" : "published";
      const res = await db
        .update(products)
        .set({ publishStatus: target })
        .where(and(eq(products.publishStatus, from), eq(products.isActive, true)));
      affected = (res as unknown as { affectedRows?: number }).affectedRows ?? 0;
    } else {
      return NextResponse.json({ error: "Provide ids[] or all:true" }, { status: 400 });
    }

    await db.insert(auditLog).values({
      actorUserId: parseInt(auth.session.user.id),
      action: "product.bulk_publish",
      entityType: "product",
      meta: { target, affected, all: !!body.all },
    });

    return NextResponse.json({ ok: true, affected, status: target });
  } catch (error) {
    console.error("Bulk publish error:", error);
    return NextResponse.json({ error: "Bulk update failed" }, { status: 500 });
  }
}
