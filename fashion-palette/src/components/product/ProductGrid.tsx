import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  isLoading?: boolean;
  loadingCount?: number;
  className?: string;
}

export default function ProductGrid({
  products,
  columns = 4,
  isLoading = false,
  loadingCount = 8,
  className,
}: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  if (isLoading) {
    return (
      <div className={cn("grid gap-4 md:gap-6", gridCols[columns], className)}>
        {Array.from({ length: loadingCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium text-muted">No products found</p>
        <p className="text-sm text-muted mt-2">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:gap-6", gridCols[columns], className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
