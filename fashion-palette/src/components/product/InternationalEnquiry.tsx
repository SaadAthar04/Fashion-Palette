"use client";

import { useState } from "react";
import { Globe, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCurrency } from "@/hooks/useCurrency";
import { internationalEnquiryUrl, type ProductRef } from "@/lib/whatsapp";

// Final feedback B9: international customers order via WhatsApp. Before opening
// the chat we explain that the displayed currency is only an estimate and that
// the final quote (product price, shipping, payment, customs) is confirmed
// separately. The prefilled message carries the product, article code, URL,
// selected display currency and destination country.
export default function InternationalEnquiry({ product }: { product: ProductRef }) {
  const { code } = useCurrency();
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("");

  const href = internationalEnquiryUrl(product, { currency: code, country: country.trim() || undefined });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-accent transition-colors"
      >
        <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
        Ordering from outside Pakistan?
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <button onClick={() => setOpen(false)} aria-label="Close" className="absolute top-4 right-4 text-muted hover:text-primary">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold mb-1">International order enquiry</h3>
            <p className="text-[13px] text-muted mb-4">
              International checkout isn&apos;t active yet. Send us a WhatsApp enquiry and we&apos;ll confirm availability and a
              quotation for this product.
            </p>

            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5">Destination country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United Kingdom"
              className="w-full px-4 py-2.5 border border-border text-sm rounded focus:outline-none focus:border-accent mb-4"
            />

            <div className="bg-surface rounded p-3 text-[12px] text-muted leading-relaxed mb-4">
              The website currency ({code}) is an <strong>estimate only</strong>. The final WhatsApp quotation confirms the
              product price, shipping and available payment method. You are responsible for destination customs, taxes and
              duties unless the written quotation says otherwise. International orders are prepaid — Cash on Delivery is not
              available internationally.
            </div>

            <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              <Button className="w-full">Continue on WhatsApp</Button>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
