"use client";

import { Plus, X, Wand2 } from "lucide-react";

// Final feedback B3: structured product details so the storefront shows scannable
// sections instead of a wall of text.
export type ProductDetails = {
  included: { item: string; detail: string }[];
  components: { part: string; fabric: string; work: string; length: string; unit: string; notes: string }[];
  care: string[];
  disclaimers: string[];
};

export const EMPTY_DETAILS: ProductDetails = { included: [], components: [], care: [], disclaimers: [] };

const COMMON_DISCLAIMERS = [
  "Actual colour may vary slightly due to screen settings and photography.",
  "Accessories and props shown are for styling only and are not included.",
  "Lining and laces are not included unless stated.",
  "Embellishment and print placement may vary slightly from the image.",
];

// "Unstitched 3-Piece" template — pre-fills the common structure so managers
// complete consistent fields instead of rebuilding the layout each time.
const UNSTITCHED_3PIECE: ProductDetails = {
  included: [
    { item: "Shirt", detail: "Unstitched fabric" },
    { item: "Dupatta", detail: "Unstitched fabric" },
    { item: "Trouser", detail: "Unstitched fabric" },
  ],
  components: [
    { part: "Shirt", fabric: "", work: "", length: "", unit: "metres", notes: "" },
    { part: "Dupatta", fabric: "", work: "", length: "", unit: "metres", notes: "" },
    { part: "Trouser", fabric: "", work: "", length: "", unit: "metres", notes: "" },
  ],
  care: ["Dry clean recommended.", "Iron on reverse at low heat.", "Store folded, away from direct sunlight."],
  disclaimers: [COMMON_DISCLAIMERS[0], COMMON_DISCLAIMERS[3]],
};

export default function StructuredDetails({ value, onChange }: { value: ProductDetails; onChange: (d: ProductDetails) => void }) {
  const v: ProductDetails = { ...EMPTY_DETAILS, ...value };
  const set = (patch: Partial<ProductDetails>) => onChange({ ...v, ...patch });

  const applyTemplate = () => {
    if (v.included.length || v.components.length || v.care.length || v.disclaimers.length) {
      if (!window.confirm("Replace the current structured details with the Unstitched 3-Piece template?")) return;
    }
    onChange(structuredClone(UNSTITCHED_3PIECE));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Structured Details</h3>
        <button type="button" onClick={applyTemplate} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:text-accent-hover">
          <Wand2 className="w-3.5 h-3.5" /> Unstitched 3-Piece template
        </button>
      </div>

      {/* What's Included */}
      <section>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">What&apos;s Included</label>
        {v.included.map((row, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={row.item} onChange={(e) => set({ included: v.included.map((r, j) => j === i ? { ...r, item: e.target.value } : r) })} placeholder="e.g. Shirt" className="w-1/3 px-3 py-2 border border-border/50 text-[13px] focus:outline-none focus:border-accent" />
            <input value={row.detail} onChange={(e) => set({ included: v.included.map((r, j) => j === i ? { ...r, detail: e.target.value } : r) })} placeholder="e.g. Unstitched fabric" className="flex-1 px-3 py-2 border border-border/50 text-[13px] focus:outline-none focus:border-accent" />
            <button type="button" onClick={() => set({ included: v.included.filter((_, j) => j !== i) })} className="p-2 text-muted hover:text-sale" aria-label="Remove"><X className="w-4 h-4" /></button>
          </div>
        ))}
        <button type="button" onClick={() => set({ included: [...v.included, { item: "", detail: "" }] })} className="inline-flex items-center gap-1 text-[12px] text-accent"><Plus className="w-3.5 h-3.5" /> Add item</button>
      </section>

      {/* Component details */}
      <section>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Component measurements</label>
        {v.components.map((row, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
            {(["part", "fabric", "work", "length", "unit", "notes"] as const).map((field) => (
              <input
                key={field}
                value={row[field]}
                onChange={(e) => set({ components: v.components.map((r, j) => j === i ? { ...r, [field]: e.target.value } : r) })}
                placeholder={field === "part" ? "Part" : field === "work" ? "Embroidery/print" : field.charAt(0).toUpperCase() + field.slice(1)}
                className={`${field === "notes" ? "col-span-3" : field === "unit" || field === "length" ? "col-span-1" : "col-span-2"} px-2 py-2 border border-border/50 text-[12px] focus:outline-none focus:border-accent`}
              />
            ))}
            <button type="button" onClick={() => set({ components: v.components.filter((_, j) => j !== i) })} className="p-1 text-muted hover:text-sale" aria-label="Remove"><X className="w-4 h-4" /></button>
          </div>
        ))}
        <button type="button" onClick={() => set({ components: [...v.components, { part: "", fabric: "", work: "", length: "", unit: "", notes: "" }] })} className="inline-flex items-center gap-1 text-[12px] text-accent"><Plus className="w-3.5 h-3.5" /> Add component</button>
      </section>

      {/* Care */}
      <section>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Care instructions</label>
        {v.care.map((line, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={line} onChange={(e) => set({ care: v.care.map((r, j) => j === i ? e.target.value : r) })} placeholder="e.g. Dry clean recommended." className="flex-1 px-3 py-2 border border-border/50 text-[13px] focus:outline-none focus:border-accent" />
            <button type="button" onClick={() => set({ care: v.care.filter((_, j) => j !== i) })} className="p-2 text-muted hover:text-sale" aria-label="Remove"><X className="w-4 h-4" /></button>
          </div>
        ))}
        <button type="button" onClick={() => set({ care: [...v.care, ""] })} className="inline-flex items-center gap-1 text-[12px] text-accent"><Plus className="w-3.5 h-3.5" /> Add care line</button>
      </section>

      {/* Disclaimers */}
      <section>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Disclaimers</label>
        <div className="space-y-1.5 mb-2">
          {COMMON_DISCLAIMERS.map((d) => {
            const checked = v.disclaimers.includes(d);
            return (
              <label key={d} className="flex items-start gap-2 text-[12px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => set({ disclaimers: e.target.checked ? [...v.disclaimers, d] : v.disclaimers.filter((x) => x !== d) })}
                  className="mt-0.5 accent-accent"
                />
                <span>{d}</span>
              </label>
            );
          })}
        </div>
        {v.disclaimers.filter((d) => !COMMON_DISCLAIMERS.includes(d)).map((d) => (
          <div key={d} className="flex gap-2 mb-2">
            <input value={d} readOnly className="flex-1 px-3 py-2 border border-border/50 text-[13px] bg-surface/50" />
            <button type="button" onClick={() => set({ disclaimers: v.disclaimers.filter((x) => x !== d) })} className="p-2 text-muted hover:text-sale" aria-label="Remove"><X className="w-4 h-4" /></button>
          </div>
        ))}
        <AddCustomDisclaimer onAdd={(text) => set({ disclaimers: [...v.disclaimers, text] })} />
      </section>
    </div>
  );
}

function AddCustomDisclaimer({ onAdd }: { onAdd: (text: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => { const t = window.prompt("Custom disclaimer text"); if (t?.trim()) onAdd(t.trim()); }}
      className="inline-flex items-center gap-1 text-[12px] text-accent"
    >
      <Plus className="w-3.5 h-3.5" /> Add custom disclaimer
    </button>
  );
}
