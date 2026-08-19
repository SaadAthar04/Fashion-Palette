"use client";

import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

const KINDS = [
  { key: "received", label: "Order received" },
  { key: "accepted", label: "Order accepted" },
  { key: "shipped", label: "Order shipped" },
] as const;

// Final feedback B7: admin can preview and safely resend any of the three event
// emails. Sends are recorded in the email log + audit log server-side.
export default function OrderEmailActions({ orderId }: { orderId: number }) {
  const [busy, setBusy] = useState<string | null>(null);

  const preview = async (kind: string) => {
    setBusy(`preview:${kind}`);
    try {
      const res = await fetch(`/api/orders/${orderId}/emails?kind=${kind}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const w = window.open("", "_blank", "width=640,height=800");
      if (w) { w.document.write(data.html); w.document.close(); }
      else toast.error("Allow pop-ups to preview the email.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load preview");
    } finally {
      setBusy(null);
    }
  };

  const resend = async (kind: string, label: string) => {
    setBusy(`resend:${kind}`);
    try {
      const res = await fetch(`/api/orders/${orderId}/emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(`"${label}" email resent.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to resend");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="font-semibold mb-1">Customer emails</h2>
      <p className="text-[12px] text-muted mb-4">Preview or resend an event email. Sends are recorded in the email log.</p>
      <div className="space-y-2">
        {KINDS.map((k) => (
          <div key={k.key} className="flex items-center justify-between gap-2">
            <span className="text-[13px]">{k.label}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => preview(k.key)} isLoading={busy === `preview:${k.key}`}>Preview</Button>
              <Button variant="outline" size="sm" onClick={() => resend(k.key, k.label)} isLoading={busy === `resend:${k.key}`}>Resend</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
