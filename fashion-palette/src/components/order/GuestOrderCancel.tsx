"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

// Final feedback B6: cancel a guest order from the secure token page, with a
// clear confirmation step. Idempotent server-side, so a double-click is safe.
export default function GuestOrderCancel({ token }: { token: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const cancel = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders/guest/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not cancel this order.");
      toast.success("Your order has been cancelled. A confirmation email is on its way.");
      setConfirming(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not cancel this order.");
    } finally {
      setLoading(false);
    }
  };

  if (!confirming) {
    return (
      <div className="border border-border rounded-lg p-4">
        <p className="text-sm font-medium mb-1">Need to cancel?</p>
        <p className="text-[13px] text-muted mb-3">
          You can cancel this order until we accept it. Once accepted, fulfilment begins and it can no longer be cancelled here.
        </p>
        <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>Cancel Order</Button>
      </div>
    );
  }

  return (
    <div className="border border-sale/40 bg-sale/5 rounded-lg p-4">
      <p className="text-sm font-medium mb-1">Cancel this order?</p>
      <p className="text-[13px] text-muted mb-3">This cannot be undone. Reserved stock will be released and you&apos;ll receive a confirmation email.</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={cancel} isLoading={loading}>Yes, cancel order</Button>
        <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={loading}>Keep order</Button>
      </div>
    </div>
  );
}
