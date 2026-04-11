"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { toast } from "sonner";

type BannerRow = {
  id: number;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  ctaText: string | null;
  sortOrder: number;
  isActive: boolean;
};

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BannerRow | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", linkUrl: "", ctaText: "", sortOrder: 0, isActive: true });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const res = await fetch("/api/banners");
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const url = editing ? `/api/banners/${editing.id}` : "/api/banners";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success(editing ? "Banner updated" : "Banner created");
      closeModal();
    },
    onError: () => toast.error("Failed to save banner"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner deleted");
    },
    onError: () => toast.error("Failed to delete banner"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", subtitle: "", imageUrl: "", linkUrl: "", ctaText: "", sortOrder: 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (banner: BannerRow) => {
    setEditing(banner);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      ctaText: banner.ctaText || "",
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const banners: BannerRow[] = data?.banners || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Banner</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-muted">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Link</th>
                <th className="p-4 font-semibold">Order</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {banners.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted">No banners found</td></tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-surface/50">
                    <td className="p-4 font-medium">{banner.title || "(No title)"}</td>
                    <td className="p-4 text-muted">{banner.linkUrl || "-"}</td>
                    <td className="p-4">{banner.sortOrder}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${banner.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(banner)} className="p-1.5 hover:text-accent transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm("Delete this banner?")) deleteMutation.mutate(banner.id); }} className="p-1.5 hover:text-sale transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? "Edit Banner" : "Add Banner"} size="lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Title" id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Subtitle" id="subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <Input label="Image URL" id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required />
          <Input label="Link URL" id="linkUrl" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
          <Input label="CTA Text" id="ctaText" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
          <Input label="Sort Order" id="sortOrder" type="number" value={String(form.sortOrder)} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
            <span className="text-sm">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>Cancel</Button>
            <Button type="submit" size="sm" isLoading={saveMutation.isPending}>{editing ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
