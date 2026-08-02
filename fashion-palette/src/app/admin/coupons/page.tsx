"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { formatPrice, cn } from "@/lib/utils";

type Coupon = {
  id: number;
  code: string;
  description: string | null;
  discountType: "percent" | "fixed";
  discountValue: string;
  minSubtotal: string;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

const empty = {
  code: "", description: "", discountType: "percent", discountValue: "",
  minSubtotal: "0", usageLimit: "", startsAt: "", endsAt: "", isActive: true,
};

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [modal, setModal] = useState<null | "new" | Coupon>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => (await fetch("/api/coupons")).json(),
  });
  const coupons: Coupon[] = data?.coupons || [];

  const toggle = useMutation({
    mutationFn: async (c: Coupon) => {
      const res = await fetch(`/api/coupons/${c.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
    onError: () => toast.error("Could not update coupon"),
  });

  const del = async (c: Coupon) => {
    const ok = await confirm({ title: "Delete coupon?", message: `Delete ${c.code}? This cannot be undone.`, confirmText: "Delete", danger: true });
    if (!ok) return;
    const res = await fetch(`/api/coupons/${c.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Coupon deleted"); queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }); }
    else toast.error("Delete failed");
  };

  const fmtDiscount = (c: Coupon) => c.discountType === "percent" ? `${parseFloat(c.discountValue)}%` : formatPrice(c.discountValue);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Coupons &amp; Promotions</h1>
        <Button size="sm" onClick={() => setModal("new")}><Plus className="w-4 h-4 mr-2" />New coupon</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-muted">Loading…</div>
        ) : (
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Code</th>
                <th className="p-4 font-semibold">Discount</th>
                <th className="p-4 font-semibold">Min spend</th>
                <th className="p-4 font-semibold">Usage</th>
                <th className="p-4 font-semibold">Window</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted">No coupons yet</td></tr>
              ) : coupons.map((c) => (
                <tr key={c.id} className={cn("hover:bg-surface/50", !c.isActive && "opacity-60")}>
                  <td className="p-4">
                    <button onClick={() => setModal(c)} className="font-semibold text-accent hover:underline">{c.code}</button>
                    {c.description && <p className="text-xs text-muted">{c.description}</p>}
                  </td>
                  <td className="p-4 font-medium">{fmtDiscount(c)}</td>
                  <td className="p-4 text-muted">{parseFloat(c.minSubtotal) > 0 ? formatPrice(c.minSubtotal) : "—"}</td>
                  <td className="p-4 text-muted">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                  <td className="p-4 text-muted text-xs">
                    {c.startsAt ? new Date(c.startsAt).toLocaleDateString("en-PK") : "—"} → {c.endsAt ? new Date(c.endsAt).toLocaleDateString("en-PK") : "∞"}
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggle.mutate(c)} className={cn("text-xs font-medium px-2 py-1 rounded-full", c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600")}>
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => del(c)} className="text-red-500 hover:text-red-700" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <CouponModal
          coupon={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }); }}
        />
      )}
    </div>
  );
}

function CouponModal({ coupon, onClose, onDone }: { coupon: Coupon | null; onClose: () => void; onDone: () => void }) {
  const editing = !!coupon;
  const [form, setForm] = useState(
    coupon
      ? {
          code: coupon.code, description: coupon.description || "", discountType: coupon.discountType,
          discountValue: coupon.discountValue, minSubtotal: coupon.minSubtotal, usageLimit: coupon.usageLimit?.toString() || "",
          startsAt: coupon.startsAt?.slice(0, 10) || "", endsAt: coupon.endsAt?.slice(0, 10) || "", isActive: coupon.isActive,
        }
      : { ...empty }
  );
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { ...form, usageLimit: form.usageLimit ? Number(form.usageLimit) : null };
      const res = await fetch(editing ? `/api/coupons/${coupon!.id}` : "/api/coupons", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast.success(editing ? "Coupon updated" : "Coupon created");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{editing ? `Edit ${coupon!.code}` : "New coupon"}</h2>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Code" value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} required disabled={editing} placeholder="EID25" />
            <div>
              <label className="block text-sm font-medium mb-1.5">Discount type</label>
              <select value={form.discountType} onChange={(e) => set("discountType", e.target.value)} className={inputCls}>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (Rs.)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={form.discountType === "percent" ? "Discount %" : "Discount Rs."} type="number" value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} required />
            <Input label="Minimum spend (Rs.)" type="number" value={form.minSubtotal} onChange={(e) => set("minSubtotal", e.target.value)} />
          </div>
          <Input label="Description (optional)" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Eid sale — 25% off" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Usage limit" type="number" value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} placeholder="∞" />
            <Input label="Starts" type="date" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
            <Input label="Ends" type="date" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded border-border text-accent" />
            Active
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={loading}>{editing ? "Save" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
