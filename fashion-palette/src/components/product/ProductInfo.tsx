import { cn, calculateDiscount } from "@/lib/utils";
import Price from "@/components/currency/Price";
import Badge from "@/components/ui/Badge";
import type { Product } from "@/types";

interface ProductInfoProps {
  product: Product;
  className?: string;
}

export default function ProductInfo({
  product,
  className,
}: ProductInfoProps) {
  const hasDiscount =
    product.salePrice &&
    parseFloat(product.salePrice) < parseFloat(product.basePrice);
  const discount = hasDiscount
    ? calculateDiscount(product.basePrice, product.salePrice!)
    : 0;

  const articleCode = product.originalProductCode || product.sku;
  const stitchLabel = product.stitchType
    ? product.stitchType === "unstitched" ? "Unstitched" : "Stitched / Ready-to-wear"
    : null;
  // Quick facts: only the attributes that are actually set, in a sensible order.
  const facts = [
    { label: "Colour", value: product.color },
    { label: "Fabric", value: product.fabric },
    { label: "Work", value: product.workType },
    { label: "Pieces", value: product.pieceCount },
    { label: "Type", value: stitchLabel },
    { label: "Season", value: product.season },
    { label: "Occasion", value: product.occasion },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return (
    <div className={cn("space-y-5", className)}>
      {/* Brand */}
      {product.brand && (
        <p className="text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">
          {product.brand.name}
        </p>
      )}

      {/* Product Name */}
      <h1 className="text-2xl md:text-3xl font-light leading-tight tracking-tight">
        {product.name}
      </h1>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {product.isNewArrival && <Badge variant="new">New Arrival</Badge>}
        {product.isBestSeller && (
          <Badge variant="trending">Best Seller</Badge>
        )}
        {hasDiscount && <Badge variant="sale">-{discount}% Off</Badge>}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 flex-wrap">
        {hasDiscount ? (
          <>
            <Price pkr={product.salePrice!} className="text-2xl md:text-3xl font-semibold text-sale" />
            <Price pkr={product.basePrice} className="text-base text-muted/50 line-through" showEst={false} />
            <span className="text-[10px] font-semibold text-sale uppercase tracking-wider">
              Save{" "}
              <Price pkr={parseFloat(product.basePrice) - parseFloat(product.salePrice!)} showEst={false} />
            </span>
          </>
        ) : (
          <Price pkr={product.basePrice} className="text-2xl md:text-3xl font-semibold" />
        )}
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-border/50" />

      {/* B4: Article code visible in the purchase area (falls back to SKU). */}
      <p className="text-[11px] text-muted/60 tracking-wider">
        Article code: <span className="font-medium">{articleCode}</span>
      </p>

      {/* Short Description + link to the full details tab (Feedback 08) */}
      {product.shortDescription && (
        <div>
          <p className="text-[13px] text-muted leading-[1.8] font-light">
            {product.shortDescription}
          </p>
          {product.description && product.description.trim() !== product.shortDescription.trim() && (
            <a
              href="#product-details"
              className="inline-block mt-2 text-[12px] font-medium text-accent hover:underline"
            >
              Read full description ↓
            </a>
          )}
        </div>
      )}

      {/* B4: Quick facts — the routine questions answered at a glance. */}
      {facts.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {facts.map((f) => (
            <div key={f.label} className="bg-surface px-4 py-3.5">
              <p className="text-[10px] text-muted/60 uppercase tracking-[0.2em] mb-1">{f.label}</p>
              <p className="text-[13px] font-medium capitalize">{f.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
