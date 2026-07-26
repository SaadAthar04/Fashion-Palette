import Link from "next/link";
import { Scissors, Ruler, Truck } from "lucide-react";

// Feedback 04: "Stitching service" section on the homepage.
const points = [
  { icon: Ruler, label: "Made to measure", desc: "Share your measurements at checkout" },
  { icon: Scissors, label: "Expert tailoring", desc: "Finished by professional master tailors" },
  { icon: Truck, label: "Delivered stitched", desc: "Ready-to-wear, straight to your door" },
];

export default function StitchingService() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="bg-surface border border-border/60 px-6 py-12 md:px-14 md:py-16">
          <div className="max-w-xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
              Service
            </span>
            <h2 className="text-2xl md:text-3xl font-light mt-3 tracking-tight">
              Custom Stitching
            </h2>
            <p className="text-[13px] md:text-sm text-muted mt-4 leading-relaxed">
              Love an unstitched design? Let us stitch it for you. Add stitching to any
              unstitched suit and receive it made to your measurements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
            {points.map((p) => (
              <div key={p.label} className="flex items-start gap-3">
                <p.icon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-[13px] font-semibold">{p.label}</p>
                  <p className="text-[12px] text-muted mt-1">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/categories/stitching"
            className="inline-flex items-center gap-3 mt-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-white bg-primary px-8 py-3.5 hover:bg-accent transition-colors duration-300"
          >
            Explore Stitching
          </Link>
        </div>
      </div>
    </section>
  );
}
