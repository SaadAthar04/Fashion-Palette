"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

const SAMPLE_HEADERS = "name,sku,brandSlug,categorySlug,basePrice,salePrice,stitchType,workType,pieceCount,fabric,color,season,sourceUrl,stockQuantity,shortDescription,description,imageUrl";

export default function ImportProductsPage() {
  const [csv, setCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCsv(await file.text());
  };

  const run = async () => {
    if (loading || !csv.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/products/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data);
      toast.success(`Imported ${data.created} products (${data.skipped} skipped)`);
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
        </p>
        <div className="bg-surface p-3 text-[11px] font-mono overflow-x-auto rounded">{SAMPLE_HEADERS}</div>

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

        <Button onClick={run} isLoading={loading} disabled={!csv.trim() || loading}>Import</Button>

        {result && (
          <div className="border-t border-border pt-4 text-sm space-y-2">
            <p><strong className="text-success">{result.created}</strong> created · <strong>{result.skipped}</strong> skipped (duplicates)</p>
            {result.errors.length > 0 && (
              <div>
                <p className="text-sale font-medium">{result.errors.length} row error(s):</p>
                <ul className="list-disc pl-5 text-[12px] text-muted mt-1 space-y-0.5">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
