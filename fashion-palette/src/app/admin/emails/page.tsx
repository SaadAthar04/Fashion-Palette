"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Row = {
  id: number; toAddress: string; template: string; subject: string | null;
  status: "queued" | "sent" | "failed" | "retried"; attempts: number;
  errorMessage: string | null; createdAt: string;
};

const STATUS_CLS: Record<string, string> = {
  sent: "bg-green-100 text-green-800",
  retried: "bg-teal-100 text-teal-800",
  queued: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-700",
};

export default function AdminEmailsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-emails", status],
    queryFn: async () => (await fetch(`/api/email-log?status=${status}`)).json(),
    refetchInterval: 30000,
  });
  const rows: Row[] = data?.rows || [];

  const sendTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/email-log/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      if (json.sent) toast.success(`Test email accepted for delivery to ${json.to}. Check that inbox (incl. spam).`);
      else toast.error(`SMTP rejected the send — see the new "failed" row for the reason.`);
      queryClient.invalidateQueries({ queryKey: ["admin-emails"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Email delivery log</h1>
      <p className="text-[13px] text-muted mb-6">
        Every transactional email and its outcome. {data?.failedCount > 0 && (
          <span className="text-red-600 font-medium">{data.failedCount} failed — check SMTP settings.</span>
        )}
      </p>

      {/* SMTP test tool (Feedback 31) */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <p className="text-sm font-medium">Send a test email</p>
          <p className="text-xs text-muted">Verifies SMTP without placing an order.</p>
        </div>
        <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="you@example.com (defaults to your email)"
            className="flex-1 sm:w-72 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
          <Button size="sm" onClick={sendTest} isLoading={testing}>Send test</Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "sent", "failed", "queued", "retried"].map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={cn("text-xs font-medium px-3 py-1.5 rounded-full border capitalize transition-colors", status === s ? "bg-accent text-white border-accent" : "border-border text-muted hover:border-accent")}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {isLoading ? <div className="p-12 text-center text-muted">Loading…</div> : (
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">To</th>
                <th className="p-4 font-semibold">Template</th>
                <th className="p-4 font-semibold">Subject</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted">No emails logged yet</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface/50 align-top">
                  <td className="p-4 text-muted">{r.toAddress}</td>
                  <td className="p-4"><code className="text-xs">{r.template}</code></td>
                  <td className="p-4">
                    <p className="max-w-[280px] truncate">{r.subject}</p>
                    {r.status === "failed" && r.errorMessage && <p className="text-xs text-red-500 mt-0.5 max-w-[280px] truncate">{r.errorMessage}</p>}
                  </td>
                  <td className="p-4">
                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", STATUS_CLS[r.status])}>{r.status}</span>
                  </td>
                  <td className="p-4 text-muted text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleString("en-PK")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
