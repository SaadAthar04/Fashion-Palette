"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Package, X, AlertCircle } from "lucide-react";
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
  const [reportOrder, setReportOrder] = useState<OrderRow | null>(null);

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
                  <div className="flex items-center gap-3 justify-between md:justify-end">
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
                    {order.status === "delivered" && (
                      <Button variant="outline" size="sm" onClick={() => setReportOrder(order)}>
                        <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                        Report an issue
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reportOrder && (
        <ReportIssueModal
          order={reportOrder}
          onClose={() => setReportOrder(null)}
          onDone={() => {
            setReportOrder(null);
            queryClient.invalidateQueries({ queryKey: ["my-orders"] });
          }}
        />
      )}
    </div>
  );
}

function ReportIssueModal({ order, onClose, onDone }: { order: OrderRow; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const evidenceUrls = evidence
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, reason, evidenceUrls }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not submit your report.");
      toast.success("Your report has been submitted. We'll review it and be in touch.");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold">Report an issue</h2>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-[13px] text-muted mb-4">
          Order {order.orderNumber}. Please report a wrong, damaged, defective, or misdescribed item within 48
          hours of delivery. Add photos/an unboxing video where possible.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">What&apos;s the problem? <span className="text-red-500">*</span></label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
              minLength={5}
              className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:border-accent resize-none"
              placeholder="Describe the issue clearly…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Evidence links (optional)</label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:border-accent resize-none"
              placeholder="Paste photo/video URLs, one per line"
            />
            <p className="text-xs text-muted mt-1">You can also email evidence to support@fashionpalette.pk.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={loading}>Submit report</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
