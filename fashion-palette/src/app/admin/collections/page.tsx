"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

type Collection = {
  id: number; name: string; slug: string; brandId: number; brand: string | null;
  season: string | null; sortOrder: number; isActive: boolean;
};
type Brand = { id: number; name: string };

export default function AdminCollectionsPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [modal, setModal] = useState<null | "new" | Collection>(null);

  const { data, isLoading } = useQuery({ queryKey: ["admin-collections"], queryFn: async () => (await fetch("/api/collections")).json() });
  const { data: brandData } = useQuery({ queryKey: ["brands-min"], queryFn: async () => (await fetch("/api/brands")).json() });
  const cols: Collection[] = data?.collections || [];
  const brands: Brand[] = brandData?.brands || [];

  const toggle = useMutation({
    mutationFn: async (c: Collection) => {
      const res = await fetch(`/api/collections/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !c.isActive }) });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-collections"] }),
    onError: () => toast.error("Update failed"),
  });

  const del = async (c: Collection) => {
    const ok = await confirm({ title: "Delete collection?", message: `Delete “${c.name}”?`, confirmText: "Delete", danger: true });
    if (!ok) return;
    const res = await fetch(`/api/collections/${c.id}`, { method: "DELETE" });
    const json = await res.json();
    if (res.ok) { toast.success("Deleted"); queryClient.invalidateQueries({ queryKey: ["admin-collections"] }); }
    else toast.error(json.error || "Delete failed");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Button size="sm" onClick={() => setModal("new")}><Plus className="w-4 h-4 mr-2" />New collection</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {isLoading ? <div className="p-12 text-center text-muted">Loading…</div> : (
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Collection</th>
                <th className="p-4 font-semibold">Brand</th>
                <th className="p-4 font-semibold">Season</th>
                <th className="p-4 font-semibold">Order</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cols.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-muted">No collections</td></tr> : cols.map((c) => (
                <tr key={c.id} className={cn("hover:bg-surface/50", !c.isActive && "opacity-60")}>
                  <td className="p-4">
                    <button onClick={() => setModal(c)} className="font-medium text-accent hover:underline">{c.name}</button>
                    <p className="text-xs text-muted">{c.slug}</p>
                  </td>
                  <td className="p-4 text-muted">{c.brand || "—"}</td>
                  <td className="p-4 text-muted">{c.season || "—"}</td>
                  <td className="p-4 text-muted">{c.sortOrder}</td>
                  <td className="p-4">
                    <button onClick={() => toggle.mutate(c)} className={cn("text-xs font-medium px-2 py-1 rounded-full", c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600")}>
                      {c.isActive ? "Active" : "Hidden"}
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
        <CollectionModal
          collection={modal === "new" ? null : modal}
          brands={brands}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); queryClient.invalidateQueries({ queryKey: ["admin-collections"] }); }}
        />
      )}
    </div>
  );
}

function CollectionModal({ collection, brands, onClose, onDone }: { collection: Collection | null; brands: Brand[]; onClose: () => void; onDone: () => void }) {
  const editing = !!collection;
  const [form, setForm] = useState({
    name: collection?.name || "", brandId: collection?.brandId?.toString() || "",
    season: collection?.season || "", sortOrder: collection?.sortOrder?.toString() || "0", isActive: collection?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brandId) { toast.error("Choose a brand"); return; }
    setLoading(true);
    try {
      const res = await fetch(editing ? `/api/collections/${collection!.id}` : "/api/collections", {
        method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, brandId: Number(form.brandId), sortOrder: Number(form.sortOrder) }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast.success(editing ? "Updated" : "Created");
      onDone();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{editing ? "Edit collection" : "New collection"}</h2>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          <div>
            <label className="block text-sm font-medium mb-1.5">Brand</label>
            <select value={form.brandId} onChange={(e) => set("brandId", e.target.value)} className={inputCls} required>
              <option value="">Select brand…</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Season" value={form.season} onChange={(e) => set("season", e.target.value)} placeholder="Summer 2026" />
            <Input label="Display order" type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded border-border text-accent" /> Active
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
