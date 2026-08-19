"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { FAQJsonLd } from "@/components/seo/JsonLd";
import { cn } from "@/lib/utils";

// Final feedback A2: approved FAQ copy. These answers must match the policy
// pages, checkout behaviour and actual services (COD-only, WhatsApp for
// international/stitching). Do not reword without the owner's approval.
const faqs = [
  {
    category: "Orders & Shipping",
    id: "shipping",
    questions: [
      {
        q: "What are the delivery charges?",
        a: "Delivery within Pakistan costs PKR 500. Delivery is complimentary when the merchandise subtotal is above PKR 10,000 after discounts.",
      },
      {
        q: "How long does delivery take?",
        a: "Pakistan delivery normally takes an estimated 3–7 business days after stock confirmation. Eid holidays, public holidays, major launches, high-volume periods or courier delays may add approximately 5–7 business days.",
      },
      {
        q: "Do you deliver internationally?",
        a: "International checkout is not active yet. We currently accept Cash on Delivery orders within Pakistan. Customers outside Pakistan can contact us on WhatsApp at 0327-6796087. We will check destination availability and provide a separate quotation for the product, delivery and any known charges. Currency conversions shown on the website are estimates only.",
      },
      {
        q: "Can I track my order?",
        a: "Yes. After dispatch, we will send the courier name, tracking number and tracking link by email and/or WhatsApp. Tracking may also appear in your account or secure guest-order page where available.",
      },
    ],
  },
  {
    category: "Returns & Exchange",
    id: "returns",
    questions: [
      {
        q: "What is your return policy?",
        a: "Report a wrong, damaged, defective, missing or materially misdescribed item within 48 hours of delivery. Photos and an unedited opening video may be required. Change-of-mind returns are not accepted. Please read the Returns & Refunds Policy for the complete conditions.",
      },
      {
        q: "How do I initiate a return?",
        a: "Contact support@fashionpalette.pk or WhatsApp 0327-6796087 within 48 hours and provide your order number, reason, photos and opening video. If the request is approved, we will provide return or collection instructions. Do not send an item back without written authorization.",
      },
      {
        q: "When will I receive my refund?",
        a: "After an eligible returned item is received and inspected, the refund is normally initiated within 7–10 business days. Bank or wallet processing may require additional time. Cash on Delivery refunds are issued through an approved bank account, JazzCash or Easypaisa method.",
      },
    ],
  },
  {
    category: "Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "Cash on Delivery is currently available for eligible orders within Pakistan. Additional payment methods will appear at checkout only after they have been activated and tested.",
      },
      {
        q: "Is Cash on Delivery available everywhere?",
        a: "Cash on Delivery is available for eligible serviceable addresses within Pakistan and is confirmed during checkout. Courier availability can vary by location.",
      },
    ],
  },
  {
    category: "Products",
    id: "size-guide",
    questions: [
      {
        q: "Are all products authentic?",
        a: "Fashion Palette sells 100% original products sourced through verified and genuine retail channels. Product presentation, tags and packaging may vary by brand and collection.",
      },
      {
        q: "How do I choose the right size?",
        a: "For unstitched products, review the component and fabric lengths shown in the product details. Size and measurement information is shown for stitched or ready-to-wear products where applicable. Contact us before ordering if a required measurement is unclear.",
      },
      {
        q: "Can I get stitching done?",
        a: "Custom stitching may be requested through WhatsApp for eligible unstitched suits. Send the product link and your requirements to 0327-6796087. Measurements, stitching price and completion time must be confirmed before stitching begins.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <FAQJsonLd questions={faqs.flatMap((s) => s.questions.map((f) => ({ question: f.q, answer: f.a })))} />
      <Breadcrumb items={[{ label: "FAQ" }]} className="mb-6" />

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted mb-8">Find answers to common questions about orders, shipping, returns, and more.</p>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category} id={section.id}>
              <h2 className="text-xl font-semibold mb-4">{section.category}</h2>
              <div className="space-y-2">
                {section.questions.map((faq, i) => {
                  const key = `${section.category}-${i}`;
                  const isOpen = openIndex === key;

                  return (
                    <div key={key} className="border border-border">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface transition-colors"
                      >
                        <span className="text-sm font-medium pr-4">{faq.q}</span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-muted flex-shrink-0 transition-transform",
                            isOpen && "rotate-180"
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
