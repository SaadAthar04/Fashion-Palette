"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Subscriber = {
  id: number;
  email: string;
  isActive: boolean;
  source: string | null;
  subscribedAt: string;
  unsubscribedAt: string | null;
};

export default function AdminNewsletterPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-newsletter", q],
    queryFn: async () => (await fetch(`/api/newsletter?q=${encodeURIComponent(q)}`)).json(),
  });
  const rows: Subscriber[] = data?.subscribers || [];

  const setStatus = async (email: string, action: "suppress" | "reactivate") => {
    setBusy(email);
    try {
      const res = await fetch("/api/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(action === "suppress" ? "Subscriber suppressed" : "Subscriber reactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter"] });
    } catch {
      toast.error("Failed to update subscriber");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Newsletter subscribers</h1>
        <a href="/api/newsletter?format=csv" className="text-sm">
          <Button variant="outline" size="sm">Export CSV</Button>
        </a>
      </div>
      <p className="text-[13px] text-muted mb-6">
        {typeof data?.activeCount === "number" ? `${data.activeCount} active subscriber${data.activeCount === 1 ? "" : "s"}. ` : ""}
        VIP list — early announcements and first access (no discount promised).
      </p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by email…"
        className="w-full sm:w-80 px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent mb-6"
      />

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-muted">Loading…</div>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Source</th>
                <th className="p-4 font-semibold">Subscribed</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted">No subscribers yet</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface/50">
                  <td className="p-4">{r.email}</td>
                  <td className="p-4">
                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", r.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600")}>
                      {r.isActive ? "active" : "unsubscribed"}
                    </span>
                  </td>
                  <td className="p-4 text-muted">{r.source || "—"}</td>
                  <td className="p-4 text-muted text-xs whitespace-nowrap">{new Date(r.subscribedAt).toLocaleDateString("en-PK")}</td>
                  <td className="p-4 text-right">
                    {r.isActive ? (
                      <Button variant="outline" size="sm" onClick={() => setStatus(r.email, "suppress")} isLoading={busy === r.email}>Suppress</Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setStatus(r.email, "reactivate")} isLoading={busy === r.email}>Reactivate</Button>
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
