"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "Orders & Shipping",
    id: "shipping",
    questions: [
      {
        q: "What are the delivery charges?",
        a: "We offer FREE delivery on orders above Rs. 5,000 across Pakistan. For orders below Rs. 5,000, a flat delivery charge of Rs. 200 applies.",
      },
      {
        q: "How long does delivery take?",
        a: "Delivery typically takes 3-5 business days for major cities (Lahore, Karachi, Islamabad) and 5-7 business days for other areas across Pakistan.",
      },
      {
        q: "Do you deliver internationally?",
        a: "Currently, we only deliver within Pakistan. We plan to expand internationally soon.",
      },
      {
        q: "Can I track my order?",
        a: "Yes! Once your order is shipped, you'll receive a tracking number via SMS and email. You can also track your order from your account dashboard.",
      },
    ],
  },
  {
    category: "Returns & Exchange",
    id: "returns",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day return/exchange policy. Items must be unused, unworn, and in their original packaging with tags intact.",
      },
      {
        q: "How do I initiate a return?",
        a: "Contact us via WhatsApp at 0327-6796087 or email info@fashionpalette.pk with your order number and reason for return. We'll arrange a pickup.",
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. COD refunds are processed via bank transfer.",
      },
    ],
  },
  {
    category: "Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Cash on Delivery (COD), Bank Transfer, JazzCash, and EasyPaisa. Credit/debit card options coming soon.",
      },
      {
        q: "Is Cash on Delivery available everywhere?",
        a: "Yes, COD is available across all major cities and most towns in Pakistan.",
      },
    ],
  },
  {
    category: "Products",
    id: "size-guide",
    questions: [
      {
        q: "Are all products authentic?",
        a: "Absolutely! We only sell 100% authentic products sourced from authorized retailers and brand outlets. Every item comes with original tags and packaging.",
      },
      {
        q: "How do I choose the right size?",
        a: "Each product page includes a size guide specific to that brand. Generally: S (34-36), M (38-40), L (42-44), XL (46-48). For unstitched suits, the standard fabric length is included in the product description.",
      },
      {
        q: "Can I get stitching done?",
        a: "Currently, we sell unstitched suits as-is. However, we can recommend trusted tailors in major cities. Contact us for details.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
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
