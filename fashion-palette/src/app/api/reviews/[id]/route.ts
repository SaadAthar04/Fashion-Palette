import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, auditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/admin";

// Feedback 23: approve / unapprove a review before it shows publicly.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["admin", "catalogue_editor"]);
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.isApproved !== "boolean") {
    return NextResponse.json({ error: "isApproved required" }, { status: 400 });
  }
  await db.update(reviews).set({ isApproved: body.isApproved }).where(eq(reviews.id, parseInt(id)));
  await db.insert(auditLog).values({
    actorUserId: parseInt(auth.session.user.id),
    action: body.isApproved ? "review.approve" : "review.unapprove",
    entityType: "review",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["admin", "catalogue_editor"]);
  if (auth.error) return auth.error;
  const { id } = await params;
  await db.delete(reviews).where(eq(reviews.id, parseInt(id)));
  await db.insert(auditLog).values({
    actorUserId: parseInt(auth.session.user.id),
    action: "review.delete",
    entityType: "review",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
