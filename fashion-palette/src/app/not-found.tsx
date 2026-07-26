import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";

// Feedback 30: useful custom 404 with search + category links.
export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 md:py-28 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">404</p>
      <h1 className="text-2xl md:text-3xl font-light tracking-tight mt-3">Page not found</h1>
      <p className="text-[13px] text-muted mt-4">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>

      <form action="/search" className="mt-8 flex max-w-sm mx-auto border-b border-border focus-within:border-accent">
        <input
          name="q"
          placeholder="Search products, brands..."
          className="flex-1 py-3 text-sm focus:outline-none bg-transparent"
        />
        <button type="submit" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent px-3">
          Search
        </button>
      </form>

      <div className="flex flex-wrap justify-center gap-2 mt-8">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-4 py-2 text-[11px] uppercase tracking-wider border border-border/50 text-muted hover:border-accent hover:text-accent transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <Link href="/" className="inline-block mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent hover:text-accent-hover">
        ← Back to home
      </Link>
    </div>
  );
}
