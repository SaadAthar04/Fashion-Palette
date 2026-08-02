import Link from "next/link";
import {
  FOOTER_LINKS,
  SOCIAL_LINKS,
  SITE_NAME,
  CONTACT,
  ACTIVE_PAYMENT_METHODS,
} from "@/lib/constants";

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
            <p className="text-[13px] text-white/40 leading-[1.8] mb-6">
              A multi-brand destination for women&apos;s fashion — curated
              unstitched, prints, embroidered and festive collections from
              leading Pakistani designers.
            </p>

            {/* Business & contact (Feedback 03) */}
            <address className="not-italic text-[12.5px] text-white/40 leading-[1.8] mb-6 space-y-1">
              <p>{CONTACT.location}</p>
              <p>
                WhatsApp:{" "}
                <a href={`https://wa.me/923276796087`} className="hover:text-accent">
                  {CONTACT.whatsappDisplay}
                </a>
              </p>
              <p>
                <a href={`mailto:${CONTACT.emails.support}`} className="hover:text-accent">
                  {CONTACT.emails.support}
                </a>
              </p>
            </address>

            {/* Feedback 06: only render social icons that have a confirmed profile. */}
            {(() => {
              const socials = [
                { href: SOCIAL_LINKS.facebook, Icon: FacebookIcon, label: "Facebook" },
                { href: SOCIAL_LINKS.instagram, Icon: InstagramIcon, label: "Instagram" },
                { href: SOCIAL_LINKS.youtube, Icon: YoutubeIcon, label: "YouTube" },
              ].filter((s) => s.href);
              if (socials.length === 0) return null;
              return (
                <div className="flex gap-3">
                  {socials.map(({ href, Icon, label }) => (
                    <a
                      key={label}
                      href={href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-accent hover:bg-accent/10 transition-all duration-300"
                      aria-label={label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              );
            })()}
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
                {ACTIVE_PAYMENT_METHODS.map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 text-[10px] tracking-wider text-white/30 border border-white/[0.08] uppercase"
                  >
                    {method}
                  </span>
                ))}
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
