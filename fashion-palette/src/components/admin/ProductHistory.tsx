"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, ChevronDown } from "lucide-react";

type Entry = {
  id: number;
  action: string;
  meta: { changes?: Record<string, { from: unknown; to: unknown }> } | null;
  createdAt: string;
  actor: string | null;
};

const LABELS: Record<string, string> = {
  "product.create": "Created", "product.update": "Edited", "product.delete": "Archived",
  "product.bulk_publish": "Bulk publish",
};

export default function ProductHistory({ productId }: { productId: number }) {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["product-history", productId],
    queryFn: async () => (await fetch(`/api/products/${productId}/history`)).json(),
    enabled: open,
  });
  const history: Entry[] = data?.history || [];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between p-6">
        <span className="flex items-center gap-2 font-semibold"><History className="w-4 h-4" /> Change history</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-6">
          {history.length === 0 ? (
            <p className="text-sm text-muted">No history recorded yet.</p>
          ) : (
            <ul className="space-y-4">
              {history.map((e) => (
                <li key={e.id} className="text-sm border-l-2 border-border pl-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{LABELS[e.action] || e.action}</span>
                    <span className="text-xs text-muted">{new Date(e.createdAt).toLocaleString("en-PK")}</span>
                  </div>
                  <p className="text-xs text-muted">by {e.actor || "system"}</p>
                  {e.meta?.changes && Object.keys(e.meta.changes).length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {Object.entries(e.meta.changes).map(([field, c]) => (
                        <li key={field} className="text-xs text-muted">
                          <span className="font-medium text-primary">{field}</span>: {String(c.from)} → {String(c.to)}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
