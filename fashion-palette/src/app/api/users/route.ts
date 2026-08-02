import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, orders, auditLog } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      orderCount: count(orders.id),
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(users.id)
    .orderBy(users.createdAt);

  return NextResponse.json({ users: result });
}

// Feedback 27: an administrator can create a staff account. Email invites are
// blocked until the email provider is configured, so the admin sets an initial
// password here and shares it securely.
const STAFF_ROLES = ["catalogue_editor", "order_manager", "admin"] as const;
const createSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional().or(z.literal("")),
  role: z.enum(STAFF_ROLES),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  let data: z.infer<typeof createSchema>;
  try {
    data = createSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid staff details (password min 8 chars)." }, { status: 400 });
  }

  const email = data.email.toLowerCase().trim();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const [res] = await db
    .insert(users)
    .values({
      name: data.name,
      email,
      phone: data.phone || null,
      role: data.role,
      passwordHash,
      isActive: true,
    })
    .$returningId();

  await db.insert(auditLog).values({
    actorUserId: parseInt(auth.session.user.id),
    action: "staff.create",
    entityType: "user",
    entityId: String(res.id),
    meta: { email, role: data.role },
  });

  return NextResponse.json({ ok: true, id: res.id });
}
