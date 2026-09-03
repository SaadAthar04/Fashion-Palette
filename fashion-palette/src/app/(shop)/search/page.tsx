"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CategoryPageClient from "@/app/(shop)/categories/[slug]/CategoryPageClient";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import type { Product, Brand } from "@/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data.products ?? []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [query]);

  // Phase 2 A4: derive the brand facet from the products actually returned, so
  // the search results page offers the same filter + sort controls as category
  // pages without an extra request.
  const resultBrands = useMemo<Brand[]>(() => {
    const seen = new Map<number, Brand>();
    for (const p of results) {
      if (p.brand && !seen.has(p.brand.id)) seen.set(p.brand.id, p.brand as Brand);
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [results]);

  if (query && !loading && results.length > 0) {
    // Hand off to the shared filter/sort client once we have results.
    return (
      <CategoryPageClient
        slug="search"
        categoryName={`Search results for “${query}”`}
        products={results}
        brands={resultBrands}
      />
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Search Results" }]} className="mb-6" />

      {query ? (
        <>
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">
              Search Results for &ldquo;{query}&rdquo;
            </h1>
            <div className="w-10 h-[1px] bg-accent mt-3" />
            {!loading && (
              <p className="text-[13px] text-muted mt-3">
                {results.length} products found
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-border mx-auto mb-4" strokeWidth={1} />
              <h2 className="text-lg font-light mb-2">No results found</h2>
              <p className="text-[13px] text-muted max-w-md mx-auto">
                We couldn&apos;t find anything matching &ldquo;{query}&rdquo;.
                Try a different search term or browse our categories.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="px-4 py-2 text-[11px] uppercase tracking-wider border border-border/50 text-muted hover:border-accent hover:text-accent transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-border mx-auto mb-4" strokeWidth={1} />
          <h2 className="text-lg font-light mb-2">Search our collection</h2>
          <p className="text-[13px] text-muted">
            Enter a search term to find products.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
