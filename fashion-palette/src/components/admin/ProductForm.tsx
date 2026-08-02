"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { X, Plus, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { slugify } from "@/lib/utils";
import { PRODUCT_FABRICS, PRODUCT_OCCASIONS, PRODUCT_SIZES } from "@/lib/constants";
import { toast } from "sonner";

type ImageItem = { imageUrl: string; altText: string; isPrimary: boolean };
type VariantItem = { size: string; color: string; colorHex: string; stockQuantity: number; priceAdjustment: string; skuSuffix: string };

type ProductFormData = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  brandId: number;
  categoryId: number;
  basePrice: string;
  salePrice: string;
  fabric: string;
  occasion: string;
  stitchType: string;
  workType: string;
  pieceCount: string;
  season: string;
  color: string;
  careInstructions: string;
  sourceUrl: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  publishStatus: string;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string;
  metaTitle: string;
  metaDescription: string;
};

interface ProductFormProps {
  // Partial so edit-mode can pass a subset; the form merges with defaults.
  initialData?: Partial<ProductFormData> & { images?: ImageItem[]; variants?: VariantItem[] };
  productId?: number;
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaults: ProductFormData = {
    name: "", slug: "", description: "", shortDescription: "",
    brandId: 0, categoryId: 0,
    basePrice: "", salePrice: "",
    fabric: "", occasion: "",
    stitchType: "", workType: "", pieceCount: "",
    season: "", color: "", careInstructions: "", sourceUrl: "",
    isFeatured: false, isNewArrival: false, isBestSeller: false, isActive: true,
    publishStatus: "draft",
    stockQuantity: 0, lowStockThreshold: 3, sku: "",
    metaTitle: "", metaDescription: "",
  };
  // Merge so edit-mode products missing newer fields still get safe defaults,
  // and DB nulls become empty strings for controlled inputs.
  const [form, setForm] = useState<ProductFormData>(() => {
    const merged = { ...defaults, ...(initialData ?? {}) } as Record<string, unknown>;
    for (const k of Object.keys(defaults)) {
      if (merged[k] === null || merged[k] === undefined) merged[k] = defaults[k as keyof ProductFormData];
    }
    return merged as unknown as ProductFormData;
  });

  const [images, setImages] = useState<ImageItem[]>(initialData?.images || []);
  const [variants, setVariants] = useState<VariantItem[]>(initialData?.variants || []);

  const { data: brandsData } = useQuery({
    queryKey: ["brands-list"],
    queryFn: async () => { const res = await fetch("/api/brands"); return res.json(); },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories-list"],
    queryFn: async () => { const res = await fetch("/api/categories"); return res.json(); },
  });

  const brands = brandsData?.brands || [];
  const categories = categoriesData?.categories || [];

  const updateField = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          setImages((prev) => [...prev, { imageUrl: data.url, altText: "", isPrimary: prev.length === 0 }]);
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { size: "", color: "", colorHex: "", stockQuantity: 0, priceAdjustment: "0.00", skuSuffix: "" }]);
  };

  const updateVariant = (index: number, field: string, value: unknown) => {
    setVariants((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        brandId: Number(form.brandId),
        categoryId: Number(form.categoryId),
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        salePrice: form.salePrice || null,
        // enum fields must be a valid value or null (never "")
        stitchType: form.stitchType || null,
        workType: form.workType || null,
        pieceCount: form.pieceCount || null,
        images,
        variants,
      };

      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      toast.success(productId ? "Product updated!" : "Product created!");
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            <Input label="Product Name" id="name" value={form.name} onChange={(e) => { updateField("name", e.target.value); if (!productId) updateField("slug", slugify(e.target.value)); }} required />
            <Input label="Slug" id="slug" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} required />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Description</label>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={5} className="w-full px-4 py-3 border border-border/50 text-[13px] focus:outline-none focus:border-accent" />
            </div>
            <Input label="Short Description" id="shortDescription" value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} />
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">Pricing & Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="SKU" id="sku" value={form.sku} onChange={(e) => updateField("sku", e.target.value)} required />
              <Input label="Base Price (Rs.)" id="basePrice" value={form.basePrice} onChange={(e) => updateField("basePrice", e.target.value)} required />
              <Input label="Sale Price (Rs.)" id="salePrice" value={form.salePrice} onChange={(e) => updateField("salePrice", e.target.value)} placeholder="Leave empty if no sale" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Stock Quantity" id="stockQuantity" type="number" value={String(form.stockQuantity)} onChange={(e) => updateField("stockQuantity", parseInt(e.target.value) || 0)} />
              <Input label="Low-stock alert at" id="lowStockThreshold" type="number" value={String(form.lowStockThreshold)} onChange={(e) => updateField("lowStockThreshold", parseInt(e.target.value) || 0)} placeholder="e.g. 3" />
            </div>
          </div>

          {/* Fashion details (Feedback 09) */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">Fashion Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Stitch Type</label>
                <select value={form.stitchType} onChange={(e) => updateField("stitchType", e.target.value)} className="w-full px-4 py-3 border border-border/50 text-[13px] bg-white focus:outline-none focus:border-accent">
                  <option value="">-</option>
                  <option value="unstitched">Unstitched</option>
                  <option value="stitched">Stitched</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Work</label>
                <select value={form.workType} onChange={(e) => updateField("workType", e.target.value)} className="w-full px-4 py-3 border border-border/50 text-[13px] bg-white focus:outline-none focus:border-accent">
                  <option value="">-</option>
                  <option value="print">Print</option>
                  <option value="embroidered">Embroidered</option>
                  <option value="plain">Plain</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Pieces</label>
                <select value={form.pieceCount} onChange={(e) => updateField("pieceCount", e.target.value)} className="w-full px-4 py-3 border border-border/50 text-[13px] bg-white focus:outline-none focus:border-accent">
                  <option value="">-</option>
                  <option value="1-piece">1 Piece</option>
                  <option value="2-piece">2 Piece</option>
                  <option value="3-piece">3 Piece</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Colour" id="color" value={form.color} onChange={(e) => updateField("color", e.target.value)} />
              <Input label="Season" id="season" value={form.season} onChange={(e) => updateField("season", e.target.value)} placeholder="e.g. Summer 2026" />
              <Input label="Source URL" id="sourceUrl" value={form.sourceUrl} onChange={(e) => updateField("sourceUrl", e.target.value)} placeholder="Designer page" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Care Instructions</label>
              <textarea value={form.careInstructions} onChange={(e) => updateField("careInstructions", e.target.value)} rows={2} className="w-full px-4 py-3 border border-border/50 text-[13px] focus:outline-none focus:border-accent" />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative group border border-border rounded-lg overflow-hidden aspect-[3/4]">
                  <img src={img.imageUrl} alt={img.altText} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setPrimaryImage(i)} className={`text-xs px-2 py-1 rounded ${img.isPrimary ? "bg-accent text-white" : "bg-white text-primary"}`}>
                      {img.isPrimary ? "Primary" : "Set Primary"}
                    </button>
                    <button type="button" onClick={() => removeImage(i)} className="p-1 bg-red-500 text-white rounded">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              <label className="border-2 border-dashed border-border rounded-lg aspect-[3/4] flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors">
                <Upload className="w-6 h-6 text-muted mb-1" />
                <span className="text-xs text-muted">Upload</span>
                <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Variants</h3>
              <button type="button" onClick={addVariant} className="text-sm text-accent hover:text-accent-hover flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Variant
              </button>
            </div>
            {variants.length === 0 ? (
              <p className="text-sm text-muted">No variants added. Add variants for different sizes/colors.</p>
            ) : (
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end p-3 bg-surface rounded-lg">
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-muted">Size</label>
                      <select value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} className="w-full px-2 py-1.5 border border-border/50 text-sm rounded bg-white">
                        <option value="">-</option>
                        {PRODUCT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-muted">Color</label>
                      <input value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} className="w-full px-2 py-1.5 border border-border/50 text-sm rounded" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-muted">Stock</label>
                      <input type="number" value={v.stockQuantity} onChange={(e) => updateVariant(i, "stockQuantity", parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 border border-border/50 text-sm rounded" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-muted">Price +/-</label>
                      <input value={v.priceAdjustment} onChange={(e) => updateVariant(i, "priceAdjustment", e.target.value)} className="w-full px-2 py-1.5 border border-border/50 text-sm rounded" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-muted">SKU Suffix</label>
                      <input value={v.skuSuffix} onChange={(e) => updateVariant(i, "skuSuffix", e.target.value)} className="w-full px-2 py-1.5 border border-border/50 text-sm rounded" />
                    </div>
                    <button type="button" onClick={() => removeVariant(i)} className="p-1.5 text-sale hover:text-red-700 self-end">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Category & Brand */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">Organization</h3>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Brand</label>
              <select value={form.brandId} onChange={(e) => updateField("brandId", parseInt(e.target.value))} className="w-full px-4 py-3 border border-border/50 text-[13px] bg-white focus:outline-none focus:border-accent" required>
                <option value={0}>Select brand</option>
                {brands.map((b: { id: number; name: string }) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Category</label>
              <select value={form.categoryId} onChange={(e) => updateField("categoryId", parseInt(e.target.value))} className="w-full px-4 py-3 border border-border/50 text-[13px] bg-white focus:outline-none focus:border-accent" required>
                <option value={0}>Select category</option>
                {categories.map((c: { id: number; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Fabric</label>
              <select value={form.fabric} onChange={(e) => updateField("fabric", e.target.value)} className="w-full px-4 py-3 border border-border/50 text-[13px] bg-white focus:outline-none focus:border-accent">
                <option value="">Select fabric</option>
                {PRODUCT_FABRICS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Occasion</label>
              <select value={form.occasion} onChange={(e) => updateField("occasion", e.target.value)} className="w-full px-4 py-3 border border-border/50 text-[13px] bg-white focus:outline-none focus:border-accent">
                <option value="">Select occasion</option>
                {PRODUCT_OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-3">
            <h3 className="font-semibold">Visibility</h3>
            {/* Feedback 11: clear visibility states — only Published is public */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Publish Status</label>
              <select value={form.publishStatus} onChange={(e) => updateField("publishStatus", e.target.value)} className="w-full px-4 py-3 border border-border/50 text-[13px] bg-white focus:outline-none focus:border-accent">
                <option value="draft">Draft — not finished, hidden</option>
                <option value="published">Published — live &amp; public</option>
                <option value="hidden">Hidden — temporarily off-sale</option>
                <option value="archived">Archived — retired</option>
              </select>
              <p className="text-[11px] text-muted mt-1.5">Only <strong>Published</strong> products appear on the storefront.</p>
            </div>
            {[
              { key: "isActive", label: "Active" },
              { key: "isFeatured", label: "Featured" },
              { key: "isNewArrival", label: "New Arrival" },
              { key: "isBestSeller", label: "Best Seller" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={form[key as keyof ProductFormData] as boolean} onChange={(e) => updateField(key, e.target.checked)} className="rounded" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>

          {/* SEO */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">SEO</h3>
            <Input label="Meta Title" id="metaTitle" value={form.metaTitle} onChange={(e) => updateField("metaTitle", e.target.value)} />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-2">Meta Description</label>
              <textarea value={form.metaDescription} onChange={(e) => updateField("metaDescription", e.target.value)} rows={3} className="w-full px-4 py-3 border border-border/50 text-[13px] focus:outline-none focus:border-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>{productId ? "Update Product" : "Create Product"}</Button>
      </div>
    </form>
  );
}
