import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coupons, auditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";

const schema = z.object({
  description: z.string().max(255).optional(),
  discountType: z.enum(["percent", "fixed"]).optional(),
  discountValue: z.coerce.number().positive().optional(),
  minSubtotal: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().int().positive().nullable().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (data.description !== undefined) update.description = data.description || null;
  if (data.discountType !== undefined) update.discountType = data.discountType;
  if (data.discountValue !== undefined) update.discountValue = String(data.discountValue);
  if (data.minSubtotal !== undefined) update.minSubtotal = String(data.minSubtotal);
  if (data.usageLimit !== undefined) update.usageLimit = data.usageLimit;
  if (data.startsAt !== undefined) update.startsAt = data.startsAt ? new Date(data.startsAt) : null;
  if (data.endsAt !== undefined) update.endsAt = data.endsAt ? new Date(data.endsAt) : null;
  if (data.isActive !== undefined) update.isActive = data.isActive;

  if (Object.keys(update).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  await db.update(coupons).set(update).where(eq(coupons.id, parseInt(id)));
  await db.insert(auditLog).values({
    actorUserId: parseInt(auth.session.user.id),
    action: "coupon.update",
    entityType: "coupon",
    entityId: id,
    meta: update,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  await db.delete(coupons).where(eq(coupons.id, parseInt(id)));
  await db.insert(auditLog).values({
    actorUserId: parseInt(auth.session.user.id),
    action: "coupon.delete",
    entityType: "coupon",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
