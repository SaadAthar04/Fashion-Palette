import { ProductCardSkeleton } from "@/components/ui/Skeleton";

// Shown instantly during navigation to catalogue pages (Next.js loading.tsx),
// so the page feels responsive while server data loads.
export default function CatalogSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <div className="h-4 w-40 bg-surface animate-pulse mb-6" />
      <div className="h-8 w-56 bg-surface animate-pulse mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
