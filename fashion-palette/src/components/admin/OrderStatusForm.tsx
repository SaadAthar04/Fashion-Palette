"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { ORDER_STATUSES } from "@/lib/constants";
import { toast } from "sonner";

interface OrderStatusFormProps {
  orderId: number;
  currentStatus: string;
  currentPaymentStatus: string;
  currentTrackingNumber: string;
  currentNotes: string;
}

export default function OrderStatusForm({
  orderId,
  currentStatus,
  currentPaymentStatus,
  currentTrackingNumber,
  currentNotes,
}: OrderStatusFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber);
  const [notes, setNotes] = useState(currentNotes);

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus, trackingNumber, notes }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success("Order updated");
      router.refresh();
    } catch {
      toast.error("Failed to update order");
    } finally {
      setIsSubmitting(false);
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

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Tracking Number</label>
        <input
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Enter tracking number"
          className="w-full px-4 py-3 border border-border/50 text-[13px] focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes..."
          className="w-full px-4 py-3 border border-border/50 text-[13px] focus:outline-none focus:border-accent resize-none"
        />
      </div>

      <Button onClick={handleUpdate} isLoading={isSubmitting} size="sm" className="w-full">
        Update Order
      </Button>
    </div>
  );
}
