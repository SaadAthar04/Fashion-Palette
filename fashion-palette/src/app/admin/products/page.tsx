"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("q", search);
      const res = await fetch(`/api/products?${params}`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deactivated");
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const products = data?.products || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const publishAll = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/products/bulk-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published", all: true }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      return d as { affected: number };
    },
    onSuccess: (d) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(`Published ${d.affected} product${d.affected === 1 ? "" : "s"}`);
    },
    onError: () => toast.error("Failed to publish drafts"),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            isLoading={publishAll.isPending}
            onClick={async () => {
              if (
                await confirm({
                  title: "Publish all drafts",
                  message: "Publish ALL draft products? They will become visible on the storefront.",
                  confirmText: "Publish all",
                })
              ) {
                publishAll.mutate();
              }
            }}
          >
            Publish all drafts
          </Button>
          <Link href="/admin/products/import">
            <Button size="sm" variant="outline">Import CSV</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-muted">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold">Brand</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted">No products found</td></tr>
              ) : (
                products.map((product: Record<string, unknown>) => {
                  const p = product as { id: number; name: string; sku: string; basePrice: string; salePrice: string | null; stockQuantity: number; isActive: boolean; brand?: { name: string }; images?: { imageUrl: string }[] };
                  const primaryImage = p.images?.[0]?.imageUrl;
                  return (
                    <tr key={p.id} className="hover:bg-surface/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-surface relative overflow-hidden rounded flex-shrink-0">
                            <Image src={getImageUrl(primaryImage)} alt={p.name} fill className="object-cover" sizes="40px" />
                          </div>
                          <span className="font-medium line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted">{p.sku}</td>
                      <td className="p-4 text-muted">{p.brand?.name || "-"}</td>
                      <td className="p-4">
                        {p.salePrice ? (
                          <div>
                            <span className="font-medium text-sale">{formatPrice(p.salePrice)}</span>
                            <span className="text-xs text-muted line-through ml-1">{formatPrice(p.basePrice)}</span>
                          </div>
                        ) : (
                          <span className="font-medium">{formatPrice(p.basePrice)}</span>
                        )}
                      </td>
                      <td className="p-4">{p.stockQuantity}</td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/products/${p.id}/edit`} className="p-1.5 hover:text-accent transition-colors"><Edit className="w-4 h-4" /></Link>
                          <button
                            onClick={async () => { if (await confirm({ title: "Deactivate product", message: "Deactivate this product? It will be hidden from the storefront.", danger: true, confirmText: "Deactivate" })) deleteMutation.mutate(p.id); }}
                            className="p-1.5 hover:text-sale transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted">
            Showing {(pagination.page - 1) * 20 + 1}-{Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-surface"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm px-3">{page} / {pagination.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-surface"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
