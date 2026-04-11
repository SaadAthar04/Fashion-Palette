"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
};

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", isActive: true, sortOrder: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(editing ? "Category updated" : "Category created");
      closeModal();
    },
    onError: () => toast.error("Failed to save category"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted");
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", isActive: true, sortOrder: 0 });
    setModalOpen(true);
  };

  const openEdit = (cat: CategoryRow) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", isActive: cat.isActive, sortOrder: cat.sortOrder });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const categories: CategoryRow[] = data?.categories || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-muted">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Slug</th>
                <th className="p-4 font-semibold">Products</th>
                <th className="p-4 font-semibold">Order</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted">No categories found</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface/50">
                    <td className="p-4 font-medium">{cat.name}</td>
                    <td className="p-4 text-muted">{cat.slug}</td>
                    <td className="p-4">{cat.productCount}</td>
                    <td className="p-4 text-muted">{cat.sortOrder}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${cat.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(cat)} className="p-1.5 hover:text-accent transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm("Delete this category?")) deleteMutation.mutate(cat.id); }} className="p-1.5 hover:text-sale transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Name" id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} required />
          <Input label="Slug" id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 border border-border/50 text-[13px] focus:outline-none focus:border-accent" />
          </div>
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
