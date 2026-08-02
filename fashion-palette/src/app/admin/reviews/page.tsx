"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Star, Check, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  user?: { name: string; email: string } | null;
  product?: { name: string; slug: string } | null;
};

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [filter, setFilter] = useState("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", filter],
    queryFn: async () => (await fetch(`/api/reviews/moderate?status=${filter}`)).json(),
  });
  const reviews: Review[] = data?.reviews || [];

  const setApproved = useMutation({
    mutationFn: async ({ id, isApproved }: { id: number; isApproved: boolean }) => {
      const res = await fetch(`/api/reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isApproved }) });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
    onError: () => toast.error("Update failed"),
  });

  const del = async (r: Review) => {
    const ok = await confirm({ title: "Delete review?", message: "This permanently removes the review.", confirmText: "Delete", danger: true });
    if (!ok) return;
    const res = await fetch(`/api/reviews/${r.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Review deleted"); queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }); }
    else toast.error("Delete failed");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Reviews</h1>
      <p className="text-[13px] text-muted mb-6">Approve reviews before they appear on product pages.</p>

      <div className="flex gap-2 mb-6">
        {["pending", "approved", "all"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("text-xs font-medium px-3 py-1.5 rounded-full border capitalize transition-colors", filter === f ? "bg-accent text-white border-accent" : "border-border text-muted hover:border-accent")}>
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted">Loading…</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center text-muted">No {filter !== "all" ? filter : ""} reviews</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={cn("w-3.5 h-3.5", n <= r.rating ? "fill-amber-400 text-amber-400" : "text-border")} />
                      ))}
                    </div>
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", r.isApproved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>
                      {r.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  {r.product && (
                    <Link href={`/products/${r.product.slug}`} target="_blank" className="text-sm font-medium text-accent hover:underline truncate block mt-1">
                      {r.product.name}
                    </Link>
                  )}
                </div>
                <span className="text-[11px] text-muted whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString("en-PK")}</span>
              </div>
              {r.comment && <p className="text-sm text-muted leading-relaxed mb-3">{r.comment}</p>}
              <p className="text-xs text-muted mb-4">by {r.user?.name || "Customer"}</p>
              <div className="flex items-center gap-2">
                {r.isApproved ? (
                  <button onClick={() => setApproved.mutate({ id: r.id, isApproved: false })} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-amber-700">
                    <Undo2 className="w-3.5 h-3.5" /> Unapprove
                  </button>
                ) : (
                  <button onClick={() => setApproved.mutate({ id: r.id, isApproved: true })} className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-800">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                <button onClick={() => del(r)} className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 ml-auto">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
