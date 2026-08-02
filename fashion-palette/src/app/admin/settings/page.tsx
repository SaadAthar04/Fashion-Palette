"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CONTACT } from "@/lib/constants";

export default function AdminSettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => (await fetch("/api/settings")).json(),
  });

  const [form, setForm] = useState({
    delivery_charge: "",
    free_delivery_threshold: "",
    low_stock_threshold: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.settings) {
      setForm({
        delivery_charge: data.settings.delivery_charge ?? "",
        free_delivery_threshold: data.settings.free_delivery_threshold ?? "",
        low_stock_threshold: data.settings.low_stock_threshold ?? "",
      });
    }
  }, [data]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      toast.success("Settings saved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-muted">Loading…</div>;

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-[13px] text-muted mb-8">
        Business rules used across the store and checkout. Changes apply immediately (server-authoritative).
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Editable settings */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Delivery charge (Rs.)"
                type="number"
                value={form.delivery_charge}
                onChange={(e) => set("delivery_charge", e.target.value)}
              />
              <Input
                label="Free delivery above (Rs.)"
                type="number"
                value={form.free_delivery_threshold}
                onChange={(e) => set("free_delivery_threshold", e.target.value)}
              />
            </div>
            <p className="text-xs text-muted mt-3">
              Applied to the merchandise subtotal at checkout. Current: Rs {form.delivery_charge} flat, free
              above Rs {form.free_delivery_threshold}.
            </p>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Inventory</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Default low-stock alert threshold"
                type="number"
                value={form.low_stock_threshold}
                onChange={(e) => set("low_stock_threshold", e.target.value)}
              />
            </div>
            <p className="text-xs text-muted mt-3">
              Products at or below this stock level show in the low-stock report. Individual products can override this.
            </p>
          </section>

          <div className="flex justify-end">
            <Button onClick={save} isLoading={saving}>Save settings</Button>
          </div>
        </div>

        {/* Read-only business details sidebar */}
        <aside className="lg:col-span-1">
          <section className="bg-surface rounded-lg p-6 lg:sticky lg:top-20">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">
              Business details &amp; payments
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Location</dt>
                <dd>{CONTACT.location}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">WhatsApp</dt>
                <dd>{CONTACT.whatsappDisplay}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Emails</dt>
                <dd className="break-words">
                  {CONTACT.emails.general}<br />{CONTACT.emails.orders}<br />
                  {CONTACT.emails.support}<br />{CONTACT.emails.privacy}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Active payment</dt>
                <dd>Cash on Delivery only</dd>
              </div>
            </dl>
            <p className="text-xs text-muted mt-4 pt-4 border-t border-border/60">
              Business details come from the published policy documents. Card/wallet options appear at
              checkout once each is onboarded and tested.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
