"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Select from "@/components/ui/Select";
import ProductGrid from "@/components/product/ProductGrid";
import FilterSidebar from "@/components/filters/FilterSidebar";
import MobileFilters from "@/components/filters/MobileFilters";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import type { Product, Brand } from "@/types";

interface CategoryPageClientProps {
  slug: string;
  categoryName: string;
  products: Product[];
  brands: Brand[];
}

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
];

function CategoryContent({
  slug,
  categoryName,
  products,
  brands,
}: CategoryPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read filter state from URL
  const selectedBrands =
    searchParams.get("brands")?.split(",").filter(Boolean) || [];
  const selectedSizes =
    searchParams.get("sizes")?.split(",").filter(Boolean) || [];
  const selectedFabrics =
    searchParams.get("fabrics")?.split(",").filter(Boolean) || [];
  const selectedOccasions =
    searchParams.get("occasions")?.split(",").filter(Boolean) || [];
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
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const toggleParam = (key: string, value: string) => {
    const current =
      searchParams.get(key)?.split(",").filter(Boolean) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [key]: updated.length > 0 ? updated.join(",") : null });
  };

  const clearAll = () => router.push(pathname, { scroll: false });

  // Client-side filtering and sorting of server-fetched products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedBrands.length > 0) {
      result = result.filter((p) =>
        selectedBrands.includes(p.brand?.slug || "")
      );
    }
    if (selectedFabrics.length > 0) {
      result = result.filter(
        (p) => p.fabric && selectedFabrics.includes(p.fabric.toLowerCase())
      );
    }
    if (selectedOccasions.length > 0) {
      result = result.filter(
        (p) =>
          p.occasion && selectedOccasions.includes(p.occasion.toLowerCase())
      );
    }
    if (minPrice) {
      result = result.filter(
        (p) => parseFloat(p.salePrice || p.basePrice) >= parseFloat(minPrice)
      );
    }
    if (maxPrice) {
      result = result.filter(
        (p) => parseFloat(p.salePrice || p.basePrice) <= parseFloat(maxPrice)
      );
    }

    // Sort
    switch (sort) {
      case "price-asc":
        result.sort(
          (a, b) =>
            parseFloat(a.salePrice || a.basePrice) -
            parseFloat(b.salePrice || b.basePrice)
        );
        break;
      case "price-desc":
        result.sort(
          (a, b) =>
            parseFloat(b.salePrice || b.basePrice) -
            parseFloat(a.salePrice || a.basePrice)
        );
        break;
      case "best-selling":
        result.sort(
          (a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)
        );
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [
    products,
    selectedBrands,
    selectedFabrics,
    selectedOccasions,
    minPrice,
    maxPrice,
    sort,
  ]);

  const filterProps = {
    brands,
    selectedBrands,
    selectedSizes,
    selectedFabrics,
    selectedOccasions,
    minPrice,
    maxPrice,
    onToggleBrand: (s: string) => toggleParam("brands", s),
    onToggleSize: (s: string) => toggleParam("sizes", s),
    onToggleFabric: (s: string) => toggleParam("fabrics", s),
    onToggleOccasion: (s: string) => toggleParam("occasions", s),
    onPriceChange: (min: string, max: string) =>
      updateParams({ minPrice: min || null, maxPrice: max || null }),
    onClearAll: clearAll,
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb
        items={[
          { label: "Categories", href: "/brands" },
          { label: categoryName },
        ]}
        className="mb-8"
      />

      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight">
            {categoryName}
          </h1>
          <div className="w-10 h-[1px] bg-accent mt-3" />
        </div>
        <p className="text-[11px] text-muted tracking-wider uppercase">
          {filteredProducts.length} products
        </p>
      </div>

      {/* Mobile: Filter + Sort */}
      <div className="flex gap-3 mb-6 lg:hidden">
        <MobileFilters {...filterProps} />
        <Select
          options={sortOptions}
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="flex-1"
        />
      </div>

      <div className="flex gap-10">
        {/* Desktop Sidebar */}
        <FilterSidebar
          {...filterProps}
          className="hidden lg:block w-60 flex-shrink-0"
        />

        {/* Product Grid */}
        <div className="flex-1">
          {/* Desktop Sort */}
          <div className="hidden lg:flex items-center justify-end mb-8">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted uppercase tracking-wider">
                Sort by:
              </span>
              <Select
                options={sortOptions}
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="w-48"
              />
            </div>
          </div>

          <ProductGrid products={filteredProducts} columns={3} />
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
