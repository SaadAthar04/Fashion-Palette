import Link from "next/link";
import Breadcrumb from "@/components/ui/Breadcrumb";

// Structured policy content. Keeps the five legal pages consistent and lets us
// auto-link @fashionpalette.pk contact addresses and the site URL.
export type PolicyBlock =
  | { p: string }
  | { h3: string }
  | { ul: string[] };

export interface PolicySection {
  heading: string;
  blocks: PolicyBlock[];
}

const OTHER_POLICIES: { href: string; label: string }[] = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/returns", label: "Returns & Refunds" },
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/payment", label: "Payment Policy" },
];

function linkify(text: string) {
  const parts = text.split(/([a-z]+@fashionpalette\.pk|https:\/\/fashionpalette\.pk)/gi);
  return parts.map((part, i) => {
    if (/^[a-z]+@fashionpalette\.pk$/i.test(part)) {
      return (
        <a key={i} href={`mailto:${part}`} className="text-accent hover:underline">
          {part}
        </a>
      );
    }
    if (/^https:\/\/fashionpalette\.pk$/i.test(part)) {
      return (
        <a key={i} href="https://fashionpalette.pk" className="text-accent hover:underline">
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function PolicyLayout({
  title,
  effectiveDate,
  intro,
  sections,
}: {
  title: string;
  effectiveDate: string;
  intro: PolicyBlock[];
  sections: PolicySection[];
}) {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: title }]} className="mb-6" />

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        <p className="text-[13px] text-muted mb-8">Effective date: {effectiveDate}</p>

        {intro.map((block, i) => (
          <Block key={i} block={block} />
        ))}

        {sections.map((section, i) => (
          <section key={i} className="mt-8">
            <h2 className="text-lg md:text-xl font-semibold mb-3">{section.heading}</h2>
            {section.blocks.map((block, j) => (
              <Block key={j} block={block} />
            ))}
          </section>
        ))}

        <div className="mt-12 pt-6 border-t border-border/60">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted mb-3">
            Related policies
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {OTHER_POLICIES.filter((plc) => plc.label !== title).map((plc) => (
              <Link
                key={plc.href}
                href={plc.href}
                className="text-[13px] text-accent hover:underline"
              >
                {plc.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ block }: { block: PolicyBlock }) {
  if ("h3" in block) {
    return <h3 className="text-[15px] font-semibold mt-5 mb-2">{block.h3}</h3>;
  }
  if ("ul" in block) {
    return (
      <ul className="list-disc pl-5 space-y-1.5 my-3 text-sm text-muted leading-relaxed">
        {block.ul.map((item, i) => (
          <li key={i}>{linkify(item)}</li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm text-muted leading-relaxed my-3">{linkify(block.p)}</p>;
}
