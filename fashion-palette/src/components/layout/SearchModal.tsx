"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { getImageUrl, formatPrice } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const popularSearches = ["Lawn", "Maria B", "Unstitched", "Embroidered", "Prints", "Zaha", "Elan", "Chiffon"];

type SuggestProduct = {
  id: number;
  slug: string;
  name: string;
  basePrice: string;
  salePrice: string | null;
  brand?: { name: string } | null;
  images?: { imageUrl: string; isPrimary: boolean }[];
};
type SuggestBrand = { id: number; name: string; slug: string };
type SuggestCategory = { id: number; name: string; slug: string };

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SuggestProduct[]>([]);
  const [brands, setBrands] = useState<SuggestBrand[]>([]);
  const [categories, setCategories] = useState<SuggestCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    // Loading is toggled in the input handler (event, not effect) to avoid
    // synchronous setState in the effect body. Render gates on `hasQuery`, so
    // stale results stay hidden without clearing here.
    if (!debouncedQuery.trim()) return;
    const controller = new AbortController();
    fetch(`/api/search?suggest=1&q=${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setBrands(data.brands ?? []);
        setCategories(data.categories ?? []);
        setLoading(false);
      })
      .catch((err) => { if (err.name !== "AbortError") setLoading(false); });
    return () => controller.abort();
  }, [debouncedQuery]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    setLoading(!!v.trim());
  };

  const go = (href: string) => {
    router.push(href);
    onClose();
    setQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  if (!isOpen) return null;

  const hasQuery = !!debouncedQuery.trim();
  const noResults = hasQuery && !loading && !products.length && !brands.length && !categories.length;

  return (
    <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pt-8 md:pt-16 pb-16">
        <div className="flex justify-end mb-8">
          <button type="button" onClick={onClose} className="p-2 text-muted hover:text-primary transition-colors" aria-label="Close search">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative">
            {loading && debouncedQuery.trim() ? (
              <Loader2 className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-accent animate-spin" />
            ) : (
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/40" strokeWidth={1.5} />
            )}
            <input
              type="text"
              value={query}
              onChange={onInputChange}
              placeholder="Search products, brands, categories..."
              className="w-full pl-8 pr-4 py-4 text-lg font-light tracking-wide border-b border-border/50 focus:outline-none focus:border-accent transition-colors placeholder:text-muted/30"
              autoFocus
            />
          </div>
        </form>

        {/* Autocomplete suggestions */}
        {hasQuery && (
          <div className="mt-6">
            {(brands.length > 0 || categories.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {brands.map((b) => (
                  <button key={`b${b.id}`} onClick={() => go(`/brands/${b.slug}`)}
                    className="px-4 py-2 text-[11px] tracking-wider border border-border/40 hover:border-accent hover:text-accent transition-colors">
                    {b.name} <span className="text-muted/50">· brand</span>
                  </button>
                ))}
                {categories.map((c) => (
                  <button key={`c${c.id}`} onClick={() => go(`/categories/${c.slug}`)}
                    className="px-4 py-2 text-[11px] tracking-wider border border-border/40 hover:border-accent hover:text-accent transition-colors">
                    {c.name} <span className="text-muted/50">· category</span>
                  </button>
                ))}
              </div>
            )}

            {products.length > 0 && (
              <div className="space-y-1">
                {products.map((p) => {
                  const img = p.images?.find((i) => i.isPrimary) ?? p.images?.[0];
                  return (
                    <button key={p.id} onClick={() => go(`/products/${p.slug}`)}
                      className="w-full flex items-center gap-4 p-2 hover:bg-surface transition-colors text-left">
                      <div className="w-12 h-16 bg-surface flex-shrink-0 overflow-hidden">
                        {img && (
                          <Image src={getImageUrl(img.imageUrl)} alt={p.name} width={48} height={64} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium truncate">{p.name}</p>
                        <p className="text-[11px] text-muted">{p.brand?.name}</p>
                      </div>
                      <span className="text-[12px] font-semibold text-accent whitespace-nowrap">
                        {formatPrice(parseFloat(p.salePrice || p.basePrice))}
                      </span>
                    </button>
                  );
                })}
                <button onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
                  className="w-full text-center mt-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent hover:text-accent-hover">
                  See all results for &ldquo;{query.trim()}&rdquo; →
                </button>
              </div>
            )}

            {noResults && (
              <div className="text-center py-10">
                <p className="text-sm">No matches for &ldquo;{debouncedQuery}&rdquo;.</p>
                <p className="text-[12px] text-muted mt-1">Try a brand name, fabric or product code.</p>
              </div>
            )}
          </div>
        )}

        {/* Popular searches (only when empty) */}
        {!hasQuery && (
          <div className="mt-10">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted/50 mb-5">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button key={term} onClick={() => go(`/search?q=${encodeURIComponent(term)}`)}
                  className="px-5 py-2.5 text-[11px] tracking-wider border border-border/30 text-muted hover:border-accent hover:text-accent transition-all">
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
