import Link from "next/link";
import { FOOTER_LINKS, SOCIAL_LINKS, SITE_NAME } from "@/lib/constants";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.64 31.64 0 000 12a31.64 31.64 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.64 31.64 0 0024 12a31.64 31.64 0 00-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white relative overflow-hidden">
      {/* Subtle decorative accent line at top */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand Column */}
          <div className="lg:pr-4">
            <Link href="/" className="inline-block mb-6">
              <span className="text-lg font-semibold tracking-[0.2em] uppercase">
                Fashion{" "}
                <span className="text-accent">Palette</span>
              </span>
            </Link>
            <p className="text-[13px] text-white/40 leading-[1.8] mb-8">
              A multi-brand destination for women&apos;s fashion — curated
              unstitched, prints, embroidered and festive collections from
              leading Pakistani designers.
            </p>
            <div className="flex gap-3">
              {[
                { href: SOCIAL_LINKS.facebook, Icon: FacebookIcon, label: "Facebook" },
                { href: SOCIAL_LINKS.instagram, Icon: InstagramIcon, label: "Instagram" },
                {
                  href: SOCIAL_LINKS.tiktok,
                  label: "TikTok",
                  Icon: ({ className }: { className?: string }) => (
                    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.55a8.19 8.19 0 004.76 1.52V6.69h-1z" />
                    </svg>
                  ),
                },
                { href: SOCIAL_LINKS.youtube, Icon: YoutubeIcon, label: "YouTube" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-accent hover:bg-accent/10 transition-all duration-300"
                  aria-label={label}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(FOOTER_LINKS).map((section) => (
            <div key={section.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 mb-6">
                {section.title}
              </h3>
              <ul className="space-y-3.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/40 hover:text-accent transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-16 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <span className="text-[10px] text-white/25 uppercase tracking-[0.2em]">
                We Accept
              </span>
              <div className="flex gap-2">
                {["COD", "Bank Transfer", "JazzCash", "EasyPaisa"].map(
                  (method) => (
                    <span
                      key={method}
                      className="px-3 py-1.5 text-[10px] tracking-wider text-white/30 border border-white/[0.08] uppercase"
                    >
                      {method}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/[0.06] py-5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <p className="text-[10px] text-white/25 text-center tracking-[0.15em] uppercase">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
