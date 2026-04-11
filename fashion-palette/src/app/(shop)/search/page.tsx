"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductGrid from "@/components/product/ProductGrid";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import type { Product } from "@/types";

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
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [query]);

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
          ) : results.length > 0 ? (
            <ProductGrid products={results} columns={4} />
          ) : (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-border mx-auto mb-4" strokeWidth={1} />
              <h2 className="text-lg font-light mb-2">No results found</h2>
              <p className="text-[13px] text-muted max-w-md mx-auto">
                We couldn&apos;t find anything matching &ldquo;{query}&rdquo;.
                Try a different search term or browse our categories.
              </p>
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
