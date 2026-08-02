import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, auditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";

const ROLES = ["customer", "catalogue_editor", "order_manager", "admin"] as const;
const patchSchema = z.object({
  role: z.enum(ROLES).optional(),
  isActive: z.boolean().optional(),
});

// Feedback 27: change a user's role or activate/deactivate (force-logout).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  const userId = parseInt(id);
  const actorId = parseInt(auth.session.user.id);

  let data: z.infer<typeof patchSchema>;
  try {
    data = patchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }
  if (data.role === undefined && data.isActive === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Guardrails: an admin cannot demote or deactivate their own account (avoids
  // locking the last admin out).
  if (userId === actorId && (data.role !== undefined || data.isActive === false)) {
    return NextResponse.json({ error: "You cannot change your own role or deactivate yourself." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (data.role !== undefined) update.role = data.role;
  if (data.isActive !== undefined) update.isActive = data.isActive;

  await db.update(users).set(update).where(eq(users.id, userId));
  await db.insert(auditLog).values({
    actorUserId: actorId,
    action: "staff.update",
    entityType: "user",
    entityId: String(userId),
    meta: { from: { role: target.role, isActive: target.isActive }, to: update },
  });

  return NextResponse.json({ ok: true });
}
