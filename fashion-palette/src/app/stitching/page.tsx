import { Metadata } from "next";
import Link from "next/link";
import { Ruler, Scissors, Truck, MessageCircle } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Custom Stitching Service",
  description:
    "Get your unstitched suits stitched to your measurements by professional tailors. Fashion Palette's made-to-measure stitching service.",
};

const steps = [
  { icon: Ruler, title: "Share your measurements", desc: "Add stitching to any unstitched suit and send us your size details." },
  { icon: Scissors, title: "Expertly tailored", desc: "Our master tailors stitch your outfit with a clean, professional finish." },
  { icon: Truck, title: "Delivered ready-to-wear", desc: "Receive your stitched outfit at your doorstep, ready to wear." },
];

export default function StitchingPage() {
  const wa = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`;

  return (
    <div>
      {/* Hero */}
      <section className="bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Breadcrumb items={[{ label: "Stitching" }]} className="mb-6 justify-center" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">Made to Measure</span>
          <h1 className="text-3xl md:text-5xl font-light tracking-tight mt-4">Custom Stitching Service</h1>
          <p className="text-[13px] md:text-sm text-muted mt-5 max-w-xl mx-auto leading-relaxed">
            Love an unstitched design? Let our professional tailors stitch it to your exact measurements —
            so it arrives ready to wear.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link href="/categories/unstitched" className="bg-primary text-white px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-accent transition-colors">
              Shop Unstitched
            </Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4" /> Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">How it works</span>
          <h2 className="text-2xl md:text-3xl font-light mt-3 tracking-tight">Three simple steps</h2>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mx-auto mb-5">
                <s.icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
              <p className="text-[11px] font-semibold text-accent mb-2">Step {i + 1}</p>
              <h3 className="text-base font-medium mb-2">{s.title}</h3>
              <p className="text-[13px] text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Note */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pb-20">
        <div className="bg-surface border border-border/60 p-8 md:p-12 text-center">
          <h3 className="text-lg font-medium">Ready to get stitched?</h3>
          <p className="text-[13px] text-muted mt-2 max-w-lg mx-auto">
            Add stitching when you order an unstitched suit, or message us on WhatsApp with your design and
            measurements for a quick quote and timeline.
          </p>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 bg-primary text-white px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-accent transition-colors">
            <MessageCircle className="w-4 h-4" /> Chat with us
          </a>
        </div>
      </section>
    </div>
  );
}
