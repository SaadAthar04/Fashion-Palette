import Link from "next/link";
import { Package, ShoppingCart, Users, DollarSign, Eye } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { orders, products, users } from "@/lib/db/schema";
import { count, sum, eq, desc } from "drizzle-orm";
import { ORDER_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    [revenueResult],
    [orderCount],
    [productCount],
    [customerCount],
    recentOrders,
  ] = await Promise.all([
    db.select({ total: sum(orders.total) }).from(orders),
    db.select({ total: count() }).from(orders),
    db.select({ total: count() }).from(products).where(eq(products.isActive, true)),
    db.select({ total: count() }).from(users).where(eq(users.role, "customer")),
    db.query.orders.findMany({
      with: { user: true, items: true },
      orderBy: () => [desc(orders.createdAt)],
      limit: 5,
    }),
  ]);

  const stats = [
    { label: "Total Revenue", value: formatPrice(parseFloat(revenueResult.total || "0")), icon: DollarSign, color: "text-success" },
    { label: "Total Orders", value: orderCount.total.toLocaleString(), icon: ShoppingCart, color: "text-success" },
    { label: "Total Products", value: productCount.total.toLocaleString(), icon: Package, color: "text-accent" },
    { label: "Total Customers", value: customerCount.total.toLocaleString(), icon: Users, color: "text-accent" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Welcome back to Fashion Palette Admin</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-accent hover:text-accent-hover">View All &rarr;</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-semibold">Order</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Items</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-muted">No orders yet</td></tr>
              ) : (
                recentOrders.map((order) => {
                  const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
                  return (
                    <tr key={order.id} className="hover:bg-surface/50">
                      <td className="py-3 font-medium">{order.orderNumber}</td>
                      <td className="py-3 text-muted">{order.user?.name || "Guest"}</td>
                      <td className="py-3 text-muted">{order.items.length}</td>
                      <td className="py-3 font-medium">{formatPrice(order.total)}</td>
                      <td className="py-3">
                        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", statusInfo?.color)}>
                          {statusInfo?.label || order.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted">
                        {new Date(order.createdAt).toLocaleDateString("en-PK")}
                      </td>
                      <td className="py-3">
                        <Link href={`/admin/orders/${order.id}`} className="p-1 hover:text-accent transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
