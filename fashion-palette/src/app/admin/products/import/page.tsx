"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

const SAMPLE_HEADERS = "name,sku,brandSlug,categorySlug,basePrice,sourcePrice,sourceCurrency,salePrice,stitchType,workType,pieceCount,fabric,color,season,sourceUrl,stockQuantity,shortDescription,description,imageUrl";

const SAMPLE_ROW = "Maria B Lawn Suit,FP-MB-001,maria-b,unstitched,8500,29.99,USD,,unstitched,print,3-piece,Lawn,Teal,Summer 2026,,20,Printed lawn suit,Full description here,/images/products/maria-b/x.webp";

type PreviewRow = {
  line: number;
  name: string;
  sku: string;
  sourceValue: string;
  sourceCurrency: string;
  finalPkr: string | null;
  status: "ok" | "skip" | "error";
  warnings: string[];
  error?: string;
};

export default function ImportProductsPage() {
  const [csv, setCsv] = useState("");
  const [loading, setLoading] = useState<false | "preview" | "import">(false);
  const [result, setResult] = useState<{ dryRun?: boolean; created: number; skipped: number; errors: string[]; preview?: PreviewRow[] } | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCsv(await file.text());
  };

  const downloadTemplate = () => {
    const blob = new Blob([`${SAMPLE_HEADERS}\n${SAMPLE_ROW}\n`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fashion-palette-product-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const run = async (dryRun: boolean) => {
    if (loading || !csv.trim()) return;
    setLoading(dryRun ? "preview" : "import");
    setResult(null);
    try {
      const res = await fetch("/api/products/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, dryRun }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data);
      if (dryRun) toast.message(`Preview: ${data.created} would import, ${data.skipped} skipped, ${data.errors.length} error(s)`);
      else toast.success(`Imported ${data.created} products (${data.skipped} skipped)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Import Products (CSV)</h1>
        <Link href="/admin/products" className="text-sm text-accent">← Back to products</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <p className="text-[13px] text-muted">
          Imported products are created as <strong>Draft</strong> and stay hidden until you publish them.
          Duplicates (matching SKU or slug) are skipped. Required columns: <code>name, sku, brandSlug, categorySlug, basePrice</code>.
          <strong>basePrice is the final PKR price</strong> — the optional <code>sourcePrice</code>/<code>sourceCurrency</code> columns are shown in the preview only (never stored) so you can confirm a price wasn&apos;t left in a foreign currency.
          Always run <strong>Preview</strong> first and review the warnings before importing.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-surface p-3 text-[11px] font-mono overflow-x-auto rounded flex-1 min-w-[240px]">{SAMPLE_HEADERS}</div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>Download template</Button>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-2">Upload CSV file</label>
          <input type="file" accept=".csv,text/csv" onChange={onFile} className="text-sm" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-2">…or paste CSV</label>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={8}
            placeholder={SAMPLE_HEADERS + "\nMaria B Lawn Suit,FP-MB-001,maria-b,unstitched,8500,,unstitched,print,3-piece,Lawn,Teal,Summer 2026,,20,Printed lawn suit,Full description,/images/products/maria-b/x.webp"}
            className="w-full px-4 py-3 border border-border/50 text-[12px] font-mono focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => run(true)} isLoading={loading === "preview"} disabled={!csv.trim() || !!loading}>
            Preview (dry run)
          </Button>
          <Button onClick={() => run(false)} isLoading={loading === "import"} disabled={!csv.trim() || !!loading}>
            Import
          </Button>
        </div>

        {result && (
          <div className="border-t border-border pt-4 text-sm space-y-2">
            {result.dryRun && <p className="text-[12px] font-medium text-accent">Preview only — nothing was imported yet.</p>}
            <p><strong className="text-success">{result.created}</strong> {result.dryRun ? "would import" : "created"} · <strong>{result.skipped}</strong> skipped (duplicates)</p>
            {result.errors.length > 0 && (
              <div>
                <p className="text-sale font-medium">{result.errors.length} row error(s):</p>
                <ul className="list-disc pl-5 text-[12px] text-muted mt-1 space-y-0.5">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            {result.preview && result.preview.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] min-w-[640px] mt-2">
                  <thead>
                    <tr className="text-left border-b border-border text-[10px] uppercase tracking-wide text-muted">
                      <th className="py-1.5 pr-3">Row</th>
                      <th className="py-1.5 pr-3">Product</th>
                      <th className="py-1.5 pr-3">SKU</th>
                      <th className="py-1.5 pr-3">Source value</th>
                      <th className="py-1.5 pr-3">Final PKR</th>
                      <th className="py-1.5 pr-3">Status / warnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.preview.map((r) => (
                      <tr key={r.line} className={r.status === "error" ? "bg-sale/5" : r.warnings.length ? "bg-amber-50" : ""}>
                        <td className="py-1.5 pr-3 text-muted">{r.line}</td>
                        <td className="py-1.5 pr-3">{r.name || <span className="text-muted">—</span>}</td>
                        <td className="py-1.5 pr-3 font-mono text-[11px]">{r.sku || "—"}</td>
                        <td className="py-1.5 pr-3 whitespace-nowrap">{r.sourceValue ? `${r.sourceValue} ${r.sourceCurrency}` : "—"}</td>
                        <td className="py-1.5 pr-3 whitespace-nowrap font-medium">{r.finalPkr ? `PKR ${Number(r.finalPkr).toLocaleString("en-PK")}` : "—"}</td>
                        <td className="py-1.5 pr-3">
                          {r.status === "error" ? (
                            <span className="text-sale font-medium">✕ {r.error}</span>
                          ) : r.status === "skip" ? (
                            <span className="text-muted">↷ {r.warnings.join("; ")}</span>
                          ) : r.warnings.length ? (
                            <span className="text-amber-700">⚠ {r.warnings.join("; ")}</span>
                          ) : (
                            <span className="text-success">✓ ok</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
