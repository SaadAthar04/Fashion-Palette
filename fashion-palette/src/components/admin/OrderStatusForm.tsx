"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { ORDER_STATUSES } from "@/lib/constants";
import { COURIERS, buildTrackingUrl, isValidTrackingNumber } from "@/lib/courier";
import { toast } from "sonner";

interface OrderStatusFormProps {
  orderId: number;
  currentStatus: string;
  currentPaymentStatus: string;
  currentCourier: string;
  currentTrackingNumber: string;
  currentNotes: string;
  currentIsTest?: boolean;
}

export default function OrderStatusForm({
  orderId,
  currentStatus,
  currentPaymentStatus,
  currentCourier,
  currentTrackingNumber,
  currentNotes,
  currentIsTest = false,
}: OrderStatusFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber);
  const [courier, setCourier] = useState(currentCourier || "");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState(currentNotes);
  const [isTest, setIsTest] = useState(currentIsTest);

  // Live preview of the generated tracking URL (B8).
  const generatedUrl = buildTrackingUrl(courier, trackingNumber);
  const shippingBlocked = status === "shipped" && (!courier || !isValidTrackingNumber(trackingNumber));

  const handleUpdate = async () => {
    if (isSubmitting) return;
    if (shippingBlocked) {
      toast.error("Select a courier and enter a valid tracking number before marking as shipped.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus, trackingNumber, courier, note, notes, isTest }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success(status === "shipped" && status !== currentStatus ? "Order marked shipped — shipment email sent." : "Order updated");
      setNote("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendShipmentEmail = async () => {
    if (resending) return;
    setResending(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resendShipmentEmail: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to resend");
      toast.success("Shipment email resent.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <h2 className="font-semibold">Update Order</h2>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Order Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-3 border border-border/50 text-[13px] bg-white focus:outline-none focus:border-accent"
        >
          {Object.entries(ORDER_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Payment Status</label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="w-full px-4 py-3 border border-border/50 text-[13px] bg-white focus:outline-none focus:border-accent"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Courier</label>
          <select
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            className="w-full px-4 py-3 border border-border/50 text-[13px] bg-white focus:outline-none focus:border-accent"
          >
            <option value="">Select courier…</option>
            {Object.entries(COURIERS).map(([key, c]) => (
              <option key={key} value={key}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Tracking #</label>
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="w-full px-4 py-3 border border-border/50 text-[13px] focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Generated tracking URL preview (B8) */}
      {(courier || trackingNumber) && (
        <div className="text-[12px] -mt-1">
          {generatedUrl ? (
            <p className="text-muted break-all">
              Tracking link: <a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="text-accent">{generatedUrl}</a>
            </p>
          ) : (
            <p className="text-muted">Pick a courier and enter a valid tracking number (letters, digits, dashes) to generate the tracking link.</p>
          )}
        </div>
      )}
      {shippingBlocked && (
        <p className="text-[12px] text-sale -mt-1">A courier and valid tracking number are required to mark this order as shipped.</p>
      )}

      {currentStatus === "shipped" && (
        <Button variant="outline" size="sm" onClick={resendShipmentEmail} isLoading={resending} className="w-full">
          Resend shipment email
        </Button>
      )}

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Note for this update (recorded in history)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Handed to courier"
          className="w-full px-4 py-3 border border-border/50 text-[13px] focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Internal Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes..."
          className="w-full px-4 py-3 border border-border/50 text-[13px] focus:outline-none focus:border-accent resize-none"
        />
      </div>

      {/* A6: exclude QA/test orders from dashboard revenue & statistics */}
      <label className="flex items-center gap-2 text-[13px] cursor-pointer select-none border-t border-border pt-4">
        <input
          type="checkbox"
          checked={isTest}
          onChange={(e) => setIsTest(e.target.checked)}
          className="w-4 h-4 accent-accent"
        />
        <span>Test order <span className="text-muted">— excluded from revenue &amp; statistics</span></span>
      </label>

      <Button onClick={handleUpdate} isLoading={isSubmitting} size="sm" className="w-full">
        Update Order
      </Button>
    </div>
  );
}
