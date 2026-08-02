import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLog, users } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { requireCatalogueEditor } from "@/lib/admin";

// Feedback 16: change history for a product (who changed what, when).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCatalogueEditor();
  if (auth.error) return auth.error;
  const { id } = await params;

  const rows = await db
    .select({
      id: auditLog.id, action: auditLog.action, meta: auditLog.meta,
      createdAt: auditLog.createdAt, actor: users.name,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.actorUserId, users.id))
    .where(and(eq(auditLog.entityType, "product"), eq(auditLog.entityId, id)))
    .orderBy(desc(auditLog.createdAt))
    .limit(50);

  return NextResponse.json({ history: rows });
}
