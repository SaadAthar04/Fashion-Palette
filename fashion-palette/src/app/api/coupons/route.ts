import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coupons, auditLog } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return NextResponse.json({ coupons: rows });
}

const schema = z.object({
  code: z.string().min(2).max(60),
  description: z.string().max(255).optional().or(z.literal("")),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.coerce.number().positive(),
  minSubtotal: z.coerce.number().min(0).default(0),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid coupon details" }, { status: 400 });
  }

  const code = data.code.toUpperCase().trim();
  const [existing] = await db.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, code)).limit(1);
  if (existing) return NextResponse.json({ error: "A coupon with this code already exists." }, { status: 409 });

  const [res] = await db.insert(coupons).values({
    code,
    description: data.description || null,
    discountType: data.discountType,
    discountValue: String(data.discountValue),
    minSubtotal: String(data.minSubtotal),
    usageLimit: data.usageLimit ?? null,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    endsAt: data.endsAt ? new Date(data.endsAt) : null,
    isActive: data.isActive,
  }).$returningId();

  await db.insert(auditLog).values({
    actorUserId: parseInt(auth.session.user.id),
    action: "coupon.create",
    entityType: "coupon",
    entityId: String(res.id),
    meta: { code },
  });

  return NextResponse.json({ ok: true, id: res.id });
}
