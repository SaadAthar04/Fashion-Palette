import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, orders, returns, brands } from "@/lib/db/schema";
import { and, eq, gt, ne, sql, count, desc, inArray } from "drizzle-orm";
import { requireRole } from "@/lib/admin";

export async function GET() {
  const auth = await requireRole(["admin", "order_manager"]);
  if (auth.error) return auth.error;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    [salesAll],
    [salesMonth],
    statusRows,
    lowStock,
    outOfStock,
    failedPayments,
    [pendingReturns],
  ] = await Promise.all([
    db.select({ orders: count(), revenue: sql<string>`coalesce(sum(${orders.total}),0)` })
      .from(orders).where(ne(orders.status, "cancelled")),
    db.select({ orders: count(), revenue: sql<string>`coalesce(sum(${orders.total}),0)` })
      .from(orders).where(and(ne(orders.status, "cancelled"), sql`${orders.createdAt} >= ${monthStart}`)),
    db.select({ status: orders.status, c: count() }).from(orders).groupBy(orders.status),
    db.select({ id: products.id, name: products.name, sku: products.sku, stock: products.stockQuantity, threshold: products.lowStockThreshold, brand: brands.name })
      .from(products).leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(eq(products.isActive, true), gt(products.stockQuantity, 0), sql`${products.stockQuantity} <= ${products.lowStockThreshold}`))
      .orderBy(products.stockQuantity).limit(100),
    db.select({ id: products.id, name: products.name, sku: products.sku, brand: brands.name })
      .from(products).leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(eq(products.isActive, true), eq(products.stockQuantity, 0)))
      .orderBy(desc(products.updatedAt)).limit(100),
    db.select({ id: orders.id, orderNumber: orders.orderNumber, total: orders.total, createdAt: orders.createdAt })
      .from(orders).where(eq(orders.paymentStatus, "failed")).orderBy(desc(orders.createdAt)).limit(50),
    db.select({ c: count() }).from(returns).where(inArray(returns.status, ["requested", "approved", "item_received", "inspected", "replacement_sent"])),
  ]);

  return NextResponse.json({
    sales: {
      allOrders: salesAll.orders,
      allRevenue: salesAll.revenue,
      monthOrders: salesMonth.orders,
      monthRevenue: salesMonth.revenue,
    },
    statusBreakdown: statusRows,
    lowStock,
    outOfStock,
    failedPayments,
    pendingReturns: pendingReturns.c,
  });
}
