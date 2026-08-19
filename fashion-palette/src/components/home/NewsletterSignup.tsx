"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage_vip" }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Distinct message for an already-subscribed email; no page reload.
        toast.success(data.message || "You're on the VIP list!");
        if (!data.alreadySubscribed) setEmail("");
      } else {
        toast.error(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-primary relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent/[0.06] to-transparent" />
        <div className="absolute top-12 left-12 w-20 h-20 border border-white/[0.04] rotate-45" />
        <div className="absolute bottom-12 right-12 w-28 h-28 border border-white/[0.04] rotate-12" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 relative">
        <div className="max-w-xl mx-auto text-center">
          {/* Decorative accent */}
          <div className="w-12 h-[1px] bg-accent mx-auto mb-6" />

          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
            Exclusive Access
          </span>

          <h2 className="text-2xl md:text-3xl font-light text-white mt-3 tracking-tight">
            Become a VIP Member
          </h2>

          <p className="text-sm text-white/35 mt-4 mb-8 tracking-wide font-light leading-relaxed">
            Join our list for early announcements and first access to upcoming
            collections.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex gap-0 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-accent/50 tracking-wide transition-colors duration-300"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-7 py-3.5 bg-accent text-white text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-accent-hover transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
            >
              {isLoading ? "..." : "Subscribe"}
            </button>
          </form>

          <p className="text-[10px] text-white/20 mt-4 tracking-wider">
            No spam, unsubscribe anytime. Read our{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 hover:text-accent transition-colors duration-300"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
