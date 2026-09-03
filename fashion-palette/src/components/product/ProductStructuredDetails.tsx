import type { Product } from "@/types";

// Final feedback B3 / Phase 2 B4: render structured product details as scannable,
// readable groups (not a wall of text). Pass `only` to render a single group
// (used by the product-page accordions); omit it to render every group in order.
export type DetailSection = "included" | "components" | "care" | "disclaimers";

function normalize(details: Product["details"]) {
  return {
    included: details?.included?.filter((r) => r.item?.trim()) ?? [],
    components: details?.components?.filter((r) => r.part?.trim()) ?? [],
    care: details?.care?.filter((c) => c?.trim()) ?? [],
    disclaimers: details?.disclaimers?.filter((d) => d?.trim()) ?? [],
  };
}

// Counts per section, so callers can decide which accordion panels to show.
export function getDetailCounts(details: Product["details"]): Record<DetailSection, number> {
  const n = normalize(details);
  return { included: n.included.length, components: n.components.length, care: n.care.length, disclaimers: n.disclaimers.length };
}

export default function ProductStructuredDetails({
  details,
  only,
}: {
  details: Product["details"];
  only?: DetailSection[];
}) {
  if (!details) return null;
  const { included, components, care, disclaimers } = normalize(details);
  if (!included.length && !components.length && !care.length && !disclaimers.length) return null;

  const show = (s: DetailSection) => !only || only.includes(s);

  return (
    <div className="space-y-8">
      {show("included") && included.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">What&apos;s Included</h3>
          <ul className="space-y-1.5 text-[13px] text-muted">
            {included.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent">•</span>
                <span><strong className="text-primary font-medium">{r.item}</strong>{r.detail ? ` — ${r.detail}` : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {show("components") && components.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">Fabric &amp; Measurements</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[420px]">
              <thead>
                <tr className="text-left border-b border-border/60 text-[10px] uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4">Part</th>
                  <th className="py-2 pr-4">Fabric</th>
                  <th className="py-2 pr-4">Work</th>
                  <th className="py-2 pr-4">Length</th>
                  <th className="py-2 pr-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {components.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-4 font-medium text-primary">{r.part}</td>
                    <td className="py-2 pr-4 text-muted">{r.fabric || "—"}</td>
                    <td className="py-2 pr-4 text-muted">{r.work || "—"}</td>
                    <td className="py-2 pr-4 text-muted whitespace-nowrap">{[r.length, r.unit].filter(Boolean).join(" ") || "—"}</td>
                    <td className="py-2 pr-4 text-muted">{r.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {show("care") && care.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">Care Instructions</h3>
          <ul className="space-y-1.5 text-[13px] text-muted list-disc pl-5">
            {care.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </section>
      )}

      {show("disclaimers") && disclaimers.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">Please Note</h3>
          <ul className="space-y-1.5 text-[12px] text-muted/90 list-disc pl-5">
            {disclaimers.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
