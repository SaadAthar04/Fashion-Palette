"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useCallback, useMemo, useState } from "react";
import { X } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Select from "@/components/ui/Select";
import ProductGrid from "@/components/product/ProductGrid";
import FilterSidebar, { type FilterProps } from "@/components/filters/FilterSidebar";
import MobileFilters from "@/components/filters/MobileFilters";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import type { Product, Brand } from "@/types";

// Products carry the Feedback-09 facet fields used for filtering.
type FacetProduct = Product & {
  stitchType?: string | null;
  workType?: string | null;
  pieceCount?: string | null;
};

interface CategoryPageClientProps {
  slug: string;
  categoryName: string;
  categoryIntro?: string;
  products: FacetProduct[];
  brands: Brand[];
}

const PAGE_SIZE = 12;

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
];

function CategoryContent({
  categoryName,
  categoryIntro,
  products,
  brands,
}: CategoryPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const getList = (k: string) => searchParams.get(k)?.split(",").filter(Boolean) || [];
  const selectedBrands = getList("brands");
  const selectedSizes = getList("sizes");
  const selectedFabrics = getList("fabrics");
  const selectedStitch = getList("stitch");
  const selectedWork = getList("work");
  const selectedPieces = getList("pieces");
  const saleOnly = searchParams.get("sale") === "1";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      });
      setVisibleCount(PAGE_SIZE);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const toggleParam = (key: string, value: string) => {
    const current = getList(key);
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [key]: updated.length > 0 ? updated.join(",") : null });
  };

  const clearAll = () => {
    setVisibleCount(PAGE_SIZE);
    router.push(pathname, { scroll: false });
  };

  const priceOf = (p: FacetProduct) => parseFloat(p.salePrice || p.basePrice);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedBrands.length) result = result.filter((p) => selectedBrands.includes(p.brand?.slug || ""));
    if (selectedFabrics.length) result = result.filter((p) => p.fabric && selectedFabrics.includes(p.fabric.toLowerCase()));
    if (selectedStitch.length) result = result.filter((p) => p.stitchType && selectedStitch.includes(p.stitchType));
    if (selectedWork.length) result = result.filter((p) => p.workType && selectedWork.includes(p.workType));
    if (selectedPieces.length) result = result.filter((p) => p.pieceCount && selectedPieces.includes(p.pieceCount));
    if (saleOnly) result = result.filter((p) => !!p.salePrice && priceOf(p) < parseFloat(p.basePrice));
    if (minPrice) result = result.filter((p) => priceOf(p) >= parseFloat(minPrice));
    if (maxPrice) result = result.filter((p) => priceOf(p) <= parseFloat(maxPrice));

    switch (sort) {
      case "price-asc": result.sort((a, b) => priceOf(a) - priceOf(b)); break;
      case "price-desc": result.sort((a, b) => priceOf(b) - priceOf(a)); break;
      case "best-selling": result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)); break;
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [products, selectedBrands, selectedFabrics, selectedStitch, selectedWork, selectedPieces, saleOnly, minPrice, maxPrice, sort]);

  const visible = filteredProducts.slice(0, visibleCount);

  // Removable chips for every active filter (Feedback 12).
  const chips: { label: string; onRemove: () => void }[] = [
    ...selectedBrands.map((s) => ({ label: brands.find((b) => b.slug === s)?.name || s, onRemove: () => toggleParam("brands", s) })),
    ...selectedStitch.map((s) => ({ label: s, onRemove: () => toggleParam("stitch", s) })),
    ...selectedWork.map((s) => ({ label: s, onRemove: () => toggleParam("work", s) })),
    ...selectedPieces.map((s) => ({ label: s, onRemove: () => toggleParam("pieces", s) })),
    ...selectedFabrics.map((s) => ({ label: s, onRemove: () => toggleParam("fabrics", s) })),
    ...selectedSizes.map((s) => ({ label: `Size ${s}`, onRemove: () => toggleParam("sizes", s) })),
    ...(saleOnly ? [{ label: "On Sale", onRemove: () => updateParams({ sale: null }) }] : []),
    ...(minPrice || maxPrice ? [{ label: `Rs ${minPrice || 0}–${maxPrice || "∞"}`, onRemove: () => updateParams({ minPrice: null, maxPrice: null }) }] : []),
  ];

  const filterProps: FilterProps = {
    brands,
    selectedBrands, selectedSizes, selectedFabrics, selectedStitch, selectedWork, selectedPieces, saleOnly,
    minPrice, maxPrice,
    onToggleBrand: (s) => toggleParam("brands", s),
    onToggleSize: (s) => toggleParam("sizes", s),
    onToggleFabric: (s) => toggleParam("fabrics", s),
    onToggleStitch: (s) => toggleParam("stitch", s),
    onToggleWork: (s) => toggleParam("work", s),
    onTogglePieces: (s) => toggleParam("pieces", s),
    onToggleSale: () => updateParams({ sale: saleOnly ? null : "1" }),
    onPriceChange: (min, max) => updateParams({ minPrice: min || null, maxPrice: max || null }),
    onClearAll: clearAll,
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: categoryName }]} className="mb-8" />

      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight">{categoryName}</h1>
          {categoryIntro && <p className="text-[13px] text-muted mt-2 max-w-xl">{categoryIntro}</p>}
          <div className="w-10 h-[1px] bg-accent mt-3" />
        </div>
        <p className="text-[11px] text-muted tracking-wider uppercase">
          {filteredProducts.length} products
        </p>
      </div>

      {/* Selected filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {chips.map((c, i) => (
            <button
              key={i}
              onClick={c.onRemove}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-[12px] capitalize hover:bg-accent/10 hover:text-accent transition-colors"
            >
              {c.label} <X className="w-3 h-3" />
            </button>
          ))}
          <button onClick={clearAll} className="text-[11px] uppercase tracking-wider text-accent hover:text-accent-hover ml-1">
            Clear all
          </button>
        </div>
      )}

      {/* Mobile: Filter + Sort */}
      <div className="flex gap-3 mb-6 lg:hidden">
        <MobileFilters {...filterProps} />
        <Select options={sortOptions} value={sort} onChange={(e) => updateParams({ sort: e.target.value })} className="flex-1" />
      </div>

      <div className="flex gap-10">
        <FilterSidebar {...filterProps} className="hidden lg:block w-60 flex-shrink-0" />

        <div className="flex-1">
          <div className="hidden lg:flex items-center justify-end mb-8">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted uppercase tracking-wider">Sort by:</span>
              <Select options={sortOptions} value={sort} onChange={(e) => updateParams({ sort: e.target.value })} className="w-48" />
            </div>
          </div>

          {visible.length > 0 ? (
            <>
              <ProductGrid products={visible} columns={3} />
              {filteredProducts.length > visibleCount && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="px-8 py-3 border border-primary text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-primary hover:text-white transition-colors"
                  >
                    Load More ({filteredProducts.length - visibleCount} left)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="border border-border/60 bg-surface/50 py-16 px-6 text-center">
              <p className="text-sm font-medium">No products match these filters.</p>
              <p className="text-[13px] text-muted mt-2">Try removing a filter or browse another category.</p>
              <button onClick={clearAll} className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent hover:text-accent-hover">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CategoryPageClient(props: CategoryPageClientProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <CategoryContent {...props} />
    </Suspense>
  );
}
