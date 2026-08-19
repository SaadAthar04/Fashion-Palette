"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

// Final feedback B5: "Notify Me When Available" — collects an email and/or
// WhatsApp number (at least one required) and subscribes to a back-in-stock
// alert. We never promise that stock is reserved.
export default function NotifyWhenAvailable({ productId, variantId }: { productId: number; variantId?: number | null }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    if (!email.trim() && !whatsapp.trim()) {
      toast.error("Enter an email or WhatsApp number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/back-in-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId: variantId ?? null, email, whatsapp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not subscribe.");
      toast.success(data.alreadySubscribed ? "You're already on the list for this item." : "Done! We'll let you know when it's back.");
      setOpen(false);
      setEmail("");
      setWhatsapp("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not subscribe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="lg" className="w-full" onClick={() => setOpen(true)}>
        <Bell className="w-4 h-4 mr-2" strokeWidth={1.5} />
        Notify Me When Available
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <button onClick={() => setOpen(false)} aria-label="Close" className="absolute top-4 right-4 text-muted hover:text-primary">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold mb-1">Notify me when available</h3>
            <p className="text-[13px] text-muted mb-4">
              We&apos;ll message you once when this item is back in stock. Provide at least one contact method. Stock is not reserved.
            </p>

            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-border text-sm rounded focus:outline-none focus:border-accent mb-3"
            />
            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5">WhatsApp number</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="03XXXXXXXXX"
              className="w-full px-4 py-2.5 border border-border text-sm rounded focus:outline-none focus:border-accent mb-4"
            />

            <Button className="w-full" onClick={submit} isLoading={loading}>Notify me</Button>
          </div>
        </div>
      )}
    </>
  );
}
