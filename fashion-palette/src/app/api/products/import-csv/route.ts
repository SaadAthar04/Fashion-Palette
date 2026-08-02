import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, brands, categories, productImages, auditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireCatalogueEditor } from "@/lib/admin";
import { slugify } from "@/lib/utils";

// Minimal CSV parser (handles quoted fields, escaped quotes, CRLF).
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "", row: string[] = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); if (row.some((v) => v.trim() !== "")) rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()])));
}

const STITCH = ["stitched", "unstitched"];
const WORK = ["print", "embroidered", "plain", "mixed"];
const PIECES = ["1-piece", "2-piece", "3-piece"];

// Feedback 22: bulk import by CSV after validation + duplicate checking.
export async function POST(req: NextRequest) {
  const auth = await requireCatalogueEditor();
  if (auth.error) return auth.error;

  try {
    const { csv, dryRun } = await req.json();
    if (typeof csv !== "string" || !csv.trim()) {
      return NextResponse.json({ error: "No CSV content provided." }, { status: 400 });
    }

    const rows = parseCsv(csv);
    if (!rows.length) return NextResponse.json({ error: "CSV has no data rows." }, { status: 400 });
    if (rows.length > 2000) return NextResponse.json({ error: "Too many rows (max 2000 per import)." }, { status: 400 });

    const brandRows = await db.select().from(brands);
    const catRows = await db.select().from(categories);
    const brandBy = new Map(brandRows.map((b) => [b.slug, b.id]));
    const catBy = new Map(catRows.map((c) => [c.slug, c.id]));

    let created = 0, skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const line = i + 2; // account for header row
      const name = r.name?.trim();
      const sku = r.sku?.trim();
      if (!name || !sku) { errors.push(`Row ${line}: missing name or sku`); continue; }

      const brandId = brandBy.get(r.brandSlug?.trim());
      const categoryId = catBy.get(r.categorySlug?.trim());
      if (!brandId) { errors.push(`Row ${line}: unknown brandSlug "${r.brandSlug}"`); continue; }
      if (!categoryId) { errors.push(`Row ${line}: unknown categorySlug "${r.categorySlug}"`); continue; }
      if (!/^\d+(\.\d{1,2})?$/.test(r.basePrice || "")) { errors.push(`Row ${line}: invalid basePrice`); continue; }

      const slug = (r.slug?.trim() || slugify(name)).slice(0, 480);

      // Duplicate check (slug or sku)
      const [dupSlug] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
      const [dupSku] = await db.select({ id: products.id }).from(products).where(eq(products.sku, sku)).limit(1);
      if (dupSlug || dupSku) { skipped++; continue; }

      // Dry-run: validate only, never write (Feedback 17 preview).
      if (dryRun) { created++; continue; }

      const stitchType = STITCH.includes(r.stitchType) ? (r.stitchType as "stitched" | "unstitched") : null;
      const workType = WORK.includes(r.workType) ? (r.workType as "print" | "embroidered" | "plain" | "mixed") : null;
      const pieceCount = PIECES.includes(r.pieceCount) ? (r.pieceCount as "1-piece" | "2-piece" | "3-piece") : null;

      const [res] = await db.insert(products).values({
        name: name.slice(0, 500),
        slug,
        sku: sku.slice(0, 100),
        description: r.description || null,
        shortDescription: r.shortDescription?.slice(0, 1000) || null,
        brandId,
        categoryId,
        basePrice: parseFloat(r.basePrice).toFixed(2),
        salePrice: /^\d+(\.\d{1,2})?$/.test(r.salePrice || "") ? parseFloat(r.salePrice).toFixed(2) : null,
        fabric: r.fabric || null,
        color: r.color || null,
        season: r.season || null,
        sourceUrl: r.sourceUrl || null,
        stitchType,
        workType,
        pieceCount,
        stockQuantity: parseInt(r.stockQuantity || "0") || 0,
        publishStatus: "draft", // imported rows start as draft (Feedback 22)
        isActive: true,
      }).$returningId();

      if (r.imageUrl) {
        await db.insert(productImages).values({ productId: res.id, imageUrl: r.imageUrl, altText: name.slice(0, 255), sortOrder: 0, isPrimary: true });
      }
      created++;
    }

    if (!dryRun) {
      await db.insert(auditLog).values({
        actorUserId: parseInt(auth.session.user.id),
        action: "product.csv_import",
        entityType: "product",
        meta: { created, skipped, errorCount: errors.length },
      });
    }

    return NextResponse.json({ ok: true, dryRun: !!dryRun, created, skipped, errors: errors.slice(0, 50) });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: "Import failed." }, { status: 500 });
  }
}
