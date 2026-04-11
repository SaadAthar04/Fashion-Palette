"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const popularSearches = [
  "Lawn Collection",
  "Maria B",
  "Wedding Dresses",
  "Unstitched Suits",
  "Khaadi",
  "Ready to Wear",
  "Chiffon",
  "Sale",
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery("");
    }
  };

  const handleQuickSearch = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
    onClose();
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 pt-8 md:pt-16">
        {/* Close button */}
        <div className="flex justify-end mb-8">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted hover:text-primary transition-colors duration-300"
            aria-label="Close search"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search
              className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/40"
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands..."
              className="w-full pl-8 pr-4 py-4 text-lg font-light tracking-wide border-b border-border/50 focus:outline-none focus:border-accent transition-colors duration-300 placeholder:text-muted/30"
              autoFocus
            />
          </div>
        </form>

        {/* Popular Searches */}
        {!debouncedQuery && (
          <div className="mt-10">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted/50 mb-5">
              Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleQuickSearch(term)}
                  className="px-5 py-2.5 text-[11px] tracking-wider border border-border/30 text-muted hover:border-accent hover:text-accent transition-all duration-300"
                >
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
