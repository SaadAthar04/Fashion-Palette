import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, orders } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
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
      createdAt: users.createdAt,
      orderCount: count(orders.id),
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(users.id)
    .orderBy(users.createdAt);

  return NextResponse.json({ users: result });
}
