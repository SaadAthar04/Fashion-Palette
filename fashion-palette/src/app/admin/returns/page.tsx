"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { formatPrice, cn } from "@/lib/utils";
import { RETURN_STATUSES } from "@/lib/constants";

type ReturnRow = {
  id: number;
  orderId: number;
  status: keyof typeof RETURN_STATUSES;
  reason: string;
  evidenceUrls: string[] | null;
  itemsJson: { name: string; quantity: number }[] | null;
  returnAuthorization: string | null;
  inspectionResult: string | null;
  courier: string | null;
  trackingNumber: string | null;
  refundAmount: string | null;
  refundMethod: string | null;
  refundReference: string | null;
  refundedAt: string | null;
  staffNotes: string | null;
  createdAt: string;
  order?: { orderNumber: string; total: string; status: string } | null;
  user?: { name: string; email: string } | null;
};

const STATUS_KEYS = Object.keys(RETURN_STATUSES) as (keyof typeof RETURN_STATUSES)[];

export default function AdminReturnsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<ReturnRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-returns", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      return (await fetch(`/api/returns?${params}`)).json();
    },
  });

  const rows: ReturnRow[] = data?.returns || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Returns &amp; Refunds</h1>
      <p className="text-[13px] text-muted mb-6">
        Manage each return from first report to final resolution. Refunds are recorded once — duplicates are blocked.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {["all", ...STATUS_KEYS].map((key) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
              statusFilter === key ? "bg-accent text-white border-accent" : "border-border text-muted hover:border-accent"
            )}
          >
            {key === "all" ? "All" : RETURN_STATUSES[key as keyof typeof RETURN_STATUSES].label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-muted">Loading…</div>
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Return</th>
                <th className="p-4 font-semibold">Order</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted">No return requests</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface/50">
                    <td className="p-4 font-medium">#{r.id}</td>
                    <td className="p-4">{r.order?.orderNumber || r.orderId}</td>
                    <td className="p-4">
                      <p className="font-medium">{r.user?.name || "Guest"}</p>
                      <p className="text-xs text-muted">{r.user?.email}</p>
                    </td>
                    <td className="p-4 text-muted max-w-[220px] truncate">{r.reason}</td>
                    <td className="p-4">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", RETURN_STATUSES[r.status]?.color)}>
                        {RETURN_STATUSES[r.status]?.label || r.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted">{new Date(r.createdAt).toLocaleDateString("en-PK")}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => setSelected(r)} className="text-accent text-xs font-medium hover:underline">Open</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selected && <ReturnDetail row={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ReturnDetail({ row, onClose }: { row: ReturnRow; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    status: row.status as string,
    inspectionResult: row.inspectionResult || "",
    returnAuthorization: row.returnAuthorization || "",
    courier: row.courier || "",
    trackingNumber: row.trackingNumber || "",
    refundAmount: row.refundAmount || "",
    refundMethod: row.refundMethod || "",
    refundReference: row.refundReference || "",
    staffNotes: row.staffNotes || "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/returns/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      return json;
    },
    onSuccess: () => {
      toast.success("Return updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-returns"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alreadyRefunded = !!row.refundedAt;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Return #{row.id}</h2>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-1 text-sm mb-5 bg-surface rounded-lg p-4">
          <p><span className="text-muted">Order:</span> <strong>{row.order?.orderNumber}</strong> ({row.order && formatPrice(row.order.total)})</p>
          <p><span className="text-muted">Customer:</span> {row.user?.name} · {row.user?.email}</p>
          {row.itemsJson && <p><span className="text-muted">Items:</span> {row.itemsJson.map((i) => `${i.name} ×${i.quantity}`).join(", ")}</p>}
        </div>

        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Customer&apos;s reason</p>
          <p className="text-sm">{row.reason}</p>
          {row.evidenceUrls && row.evidenceUrls.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {row.evidenceUrls.map((u, i) => (
                <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="text-xs text-accent underline">Evidence {i + 1}</a>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Field label="Status">
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
              {STATUS_KEYS.map((k) => <option key={k} value={k}>{RETURN_STATUSES[k].label}</option>)}
            </select>
          </Field>
          <Field label="Return authorization #">
            <input value={form.returnAuthorization} onChange={(e) => set("returnAuthorization", e.target.value)} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Return courier"><input value={form.courier} onChange={(e) => set("courier", e.target.value)} className={inputCls} /></Field>
            <Field label="Tracking #"><input value={form.trackingNumber} onChange={(e) => set("trackingNumber", e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Inspection result">
            <textarea value={form.inspectionResult} onChange={(e) => set("inspectionResult", e.target.value)} rows={2} className={inputCls} />
          </Field>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
              Refund {alreadyRefunded && <span className="text-green-700">· already refunded {row.refundedAt && new Date(row.refundedAt).toLocaleDateString("en-PK")}</span>}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (Rs.)"><input type="number" value={form.refundAmount} onChange={(e) => set("refundAmount", e.target.value)} disabled={alreadyRefunded} className={inputCls} /></Field>
              <Field label="Method"><input value={form.refundMethod} onChange={(e) => set("refundMethod", e.target.value)} disabled={alreadyRefunded} placeholder="JazzCash / bank…" className={inputCls} /></Field>
            </div>
            <Field label="Refund reference"><input value={form.refundReference} onChange={(e) => set("refundReference", e.target.value)} disabled={alreadyRefunded} className={inputCls} /></Field>
          </div>

          <Field label="Staff notes / reason">
            <textarea value={form.staffNotes} onChange={(e) => set("staffNotes", e.target.value)} rows={2} className={inputCls} />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={() => save.mutate()} isLoading={save.isPending}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white disabled:bg-surface disabled:text-muted";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      {children}
    </div>
  );
}
