"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Package, X } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import { formatPrice, cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

type OrderRow = {
  id: number;
  orderNumber: string;
  status: string;
  total: string;
  items: unknown[];
  createdAt: string;
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [cancelling, setCancelling] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) return { orders: [] };
      return res.json();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not cancel this order.");
      return json;
    },
    onSuccess: () => {
      toast.success("Your order has been cancelled.");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setCancelling(null),
  });

  const handleCancel = async (order: OrderRow) => {
    const ok = await confirm({
      title: "Cancel this order?",
      message: `Order ${order.orderNumber} will be cancelled and the items released. This can only be done before we accept and process your order.`,
      confirmText: "Cancel order",
      cancelText: "Keep order",
      danger: true,
    });
    if (!ok) return;
    setCancelling(order.id);
    cancelMutation.mutate(order.id);
  };

  const orders: OrderRow[] = data?.orders || [];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Orders" }]} className="mb-6" />

      <h1 className="text-2xl md:text-3xl font-bold mb-2">My Orders</h1>
      <p className="text-[13px] text-muted mb-8">
        You can cancel an order until we send its acceptance email. After that, fulfilment has begun —
        for a faulty, wrong, or misdescribed item, contact{" "}
        <a href="mailto:support@fashionpalette.pk" className="text-accent hover:underline">support@fashionpalette.pk</a>.
      </p>

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
          {orders.map((order) => {
            const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
            const canCancel = order.status === "pending";
            return (
              <div key={order.id} className="border border-border p-4 md:p-6 hover:border-accent/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-sm font-semibold">{order.orderNumber}</h3>
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusInfo?.color)}>
                        {statusInfo?.label || order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })} · {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 justify-between md:justify-end">
                    <p className="font-bold">{formatPrice(order.total)}</p>
                    {canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(order)}
                        isLoading={cancelling === order.id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Cancel
                      </Button>
                    )}
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
