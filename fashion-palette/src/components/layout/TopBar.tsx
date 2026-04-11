"use client";

import { FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

const messages = [
  `Complimentary Delivery on Orders Above ${formatPrice(FREE_DELIVERY_THRESHOLD)}`,
  "Effortless 7-Day Returns & Exchanges",
  "WhatsApp Concierge: 0327-6796087",
  "100% Authentic — Guaranteed Original",
];

export default function TopBar() {
  return (
    <div className="bg-primary text-white/80 text-[10px] md:text-[11px] py-2.5 overflow-hidden tracking-[0.15em] uppercase">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...messages, ...messages].map((msg, i) => (
          <span key={i} className="mx-10 inline-flex items-center gap-2.5">
            <span className="w-[3px] h-[3px] rounded-full bg-accent" />
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
