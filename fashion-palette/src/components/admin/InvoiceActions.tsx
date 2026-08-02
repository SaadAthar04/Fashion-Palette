"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

// Print / back controls — hidden when printing (see globals.css .no-print).
export default function InvoiceActions() {
  const router = useRouter();
  return (
    <div className="no-print flex items-center justify-between mb-4">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90"
      >
        <Printer className="w-4 h-4" /> Print / Save PDF
      </button>
    </div>
  );
}
