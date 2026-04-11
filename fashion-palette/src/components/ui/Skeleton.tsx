import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("shimmer bg-surface/80", className)} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3.5">
      <Skeleton className="aspect-[3/4] w-full" />
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-2/3" />
      <Skeleton className="h-3 w-20 mt-1" />
    </div>
  );
}
