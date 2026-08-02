"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Feedback 40/43: non-essential analytics/advertising cookies must not load
// until the customer consents. Google Analytics loads only when a GA id is set
// (NEXT_PUBLIC_GA_ID) AND consent is given.
const KEY = "fp-cookie-consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function CookieConsent() {
  const [choice, setChoice] = useState<string | null>("pending");

  useEffect(() => {
    setChoice(localStorage.getItem(KEY));
  }, []);

  useEffect(() => {
    if (choice === "accepted" && GA_ID && !document.getElementById("ga-src")) {
      const s = document.createElement("script");
      s.id = "ga-src";
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(s);
      const inline = document.createElement("script");
      inline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`;
      document.head.appendChild(inline);
    }
  }, [choice]);

  const decide = (v: "accepted" | "rejected") => {
    localStorage.setItem(KEY, v);
    setChoice(v);
  };

  if (choice !== null) return null; // pending (SSR) or already chosen

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 print:hidden">
      <div className="max-w-3xl mx-auto bg-primary text-white rounded-xl shadow-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-[13px] leading-relaxed flex-1 text-white/80">
          We use essential cookies to run the store. With your consent we also use analytics cookies to
          improve it. See our{" "}
          <Link href="/privacy" className="text-white underline hover:text-accent">Privacy Policy</Link>.
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => decide("rejected")} className="px-4 py-2 text-[13px] font-medium rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
            Essential only
          </button>
          <button onClick={() => decide("accepted")} className="px-4 py-2 text-[13px] font-semibold rounded-lg bg-accent hover:bg-accent/90 transition-colors">
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
