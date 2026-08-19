"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Row = {
  id: number;
  productId: number;
  email: string | null;
  whatsapp: string | null;
  status: "pending" | "notified" | "failed" | "cancelled";
  notifiedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  productName: string | null;
  brand: string | null;
  stock: number | null;
};

const STATUS_CLS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  notified: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function AdminBackInStockPage() {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bis"],
    queryFn: async () => (await fetch("/api/back-in-stock")).json(),
  });
  const rows: Row[] = data?.rows || [];
  const counts: { status: string; c: number }[] = data?.counts || [];
  const countOf = (s: string) => counts.find((c) => c.status === s)?.c ?? 0;

  const act = async (id: number, action: "resend" | "cancel") => {
    setBusy(id);
    try {
      const res = await fetch("/api/back-in-stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(action === "resend" ? "Alert re-sent" : "Request cancelled");
      queryClient.invalidateQueries({ queryKey: ["admin-bis"] });
    } catch {
      toast.error("Action failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Back-in-stock alerts</h1>
      <p className="text-[13px] text-muted mb-6">
        Customers are notified automatically by email when a product is restocked. WhatsApp-only requests stay pending for
        manual contact. Stock is never described as reserved.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(["pending", "notified", "failed", "cancelled"] as const).map((s) => (
          <div key={s} className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-xl font-bold">{countOf(s)}</p>
            <p className="text-xs text-muted capitalize">{s}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-muted">Loading…</div>
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Requested</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted">No requests yet</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface/50 align-top">
                  <td className="p-4">
                    <Link href={`/admin/products/${r.productId}/edit`} className="text-accent hover:underline">{r.productName || `#${r.productId}`}</Link>
                    {r.brand && <span className="block text-xs text-muted">{r.brand}</span>}
                  </td>
                  <td className="p-4 text-muted">
                    {r.email && <span className="block">{r.email}</span>}
                    {r.whatsapp && <span className="block">WA: {r.whatsapp}</span>}
                  </td>
                  <td className="p-4 text-muted">{r.stock ?? "—"}</td>
                  <td className="p-4">
                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", STATUS_CLS[r.status])}>{r.status}</span>
                    {r.status === "failed" && r.errorMessage && <span className="block text-xs text-red-500 mt-0.5">{r.errorMessage}</span>}
                  </td>
                  <td className="p-4 text-muted text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString("en-PK")}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    {(r.status === "failed" || r.status === "pending") && r.email && (
                      <Button variant="outline" size="sm" onClick={() => act(r.id, "resend")} isLoading={busy === r.id} className="mr-2">
                        {r.status === "failed" ? "Retry" : "Send now"}
                      </Button>
                    )}
                    {r.status !== "cancelled" && (
                      <Button variant="outline" size="sm" onClick={() => act(r.id, "cancel")} isLoading={busy === r.id}>Opt out</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
