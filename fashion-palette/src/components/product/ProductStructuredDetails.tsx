import type { Product } from "@/types";

// Final feedback B3: render structured product details as scannable, readable
// groups (not a wall of text): What's Included → measurements → care → disclaimers.
export default function ProductStructuredDetails({ details }: { details: Product["details"] }) {
  if (!details) return null;
  const included = details.included?.filter((r) => r.item?.trim()) ?? [];
  const components = details.components?.filter((r) => r.part?.trim()) ?? [];
  const care = details.care?.filter((c) => c?.trim()) ?? [];
  const disclaimers = details.disclaimers?.filter((d) => d?.trim()) ?? [];

  if (!included.length && !components.length && !care.length && !disclaimers.length) return null;

  return (
    <div className="space-y-8">
      {included.length > 0 && (
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

      {components.length > 0 && (
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

      {care.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">Care Instructions</h3>
          <ul className="space-y-1.5 text-[13px] text-muted list-disc pl-5">
            {care.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </section>
      )}

      {disclaimers.length > 0 && (
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
