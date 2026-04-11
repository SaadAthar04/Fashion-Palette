"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Package, Eye } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { formatPrice, cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) return { orders: [] };
      return res.json();
    },
  });

  const orders = data?.orders || [];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Orders" }]} className="mb-6" />

      <h1 className="text-2xl md:text-3xl font-bold mb-8">My Orders</h1>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-border mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted mb-6">Start shopping to see your orders here.</p>
          <Link href="/" className="text-accent hover:text-accent-hover font-medium">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: { id: number; orderNumber: string; status: string; total: string; items: unknown[]; createdAt: string }) => {
            const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
            return (
              <div key={order.id} className="border border-border p-4 md:p-6 hover:border-accent/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold">{order.orderNumber}</h3>
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusInfo?.color)}>
                        {statusInfo?.label || order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })} · {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold">{formatPrice(order.total)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
