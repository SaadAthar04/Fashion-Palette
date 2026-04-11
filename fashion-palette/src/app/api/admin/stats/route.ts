import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, products, users } from "@/lib/db/schema";
import { count, sum, eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const [
    [revenueResult],
    [orderCount],
    [productCount],
    [customerCount],
  ] = await Promise.all([
    db.select({ total: sum(orders.total) }).from(orders),
    db.select({ total: count() }).from(orders),
    db.select({ total: count() }).from(products).where(eq(products.isActive, true)),
    db.select({ total: count() }).from(users).where(eq(users.role, "customer")),
  ]);

  return NextResponse.json({
    revenue: parseFloat(revenueResult.total || "0"),
    orders: orderCount.total,
    products: productCount.total,
    customers: customerCount.total,
  });
}
