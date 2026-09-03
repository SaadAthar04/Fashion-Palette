import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, Mail } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { HELP_TOPICS, CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Help Centre",
  description:
    "Find answers fast — orders, shipping, returns, payments, stitching and international enquiries, all in one place.",
  alternates: { canonical: "/help" },
};

export default function HelpCentrePage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Help Centre" }]} className="mb-6" />

      <div className="max-w-3xl mb-10">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">Help Centre</h1>
        <div className="w-10 h-[1px] bg-accent mt-3" />
        <p className="text-[14px] text-muted mt-4 leading-relaxed">
          One obvious route to every common question — track an order, understand delivery and
          returns, learn about payments and stitching, or reach us directly.
        </p>
      </div>

      {/* Topic cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HELP_TOPICS.map((topic) => (
          <Link
            key={topic.label}
            href={topic.href}
            className="group border border-border/60 p-5 hover:border-accent hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-semibold text-primary group-hover:text-accent transition-colors">
                {topic.label}
              </h2>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] text-muted leading-relaxed">{topic.blurb}</p>
          </Link>
        ))}
      </div>

      {/* Direct contact */}
      <div className="mt-12 border-t border-border/60 pt-8">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary mb-4">
          Still need help?
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/923276796087`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white text-[12px] font-semibold uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            WhatsApp {CONTACT.whatsappDisplay}
          </a>
          <a
            href={`mailto:${CONTACT.emails.support}`}
            className="inline-flex items-center gap-2 px-5 py-3 border border-primary text-[12px] font-semibold uppercase tracking-[0.15em] hover:bg-surface transition-colors"
          >
            <Mail className="w-4 h-4" strokeWidth={1.5} />
            {CONTACT.emails.support}
          </a>
        </div>
        {CONTACT.supportHours && (
          <p className="text-[12px] text-muted mt-4">Support hours: {CONTACT.supportHours}</p>
        )}
      </div>
    </div>
  );
}
