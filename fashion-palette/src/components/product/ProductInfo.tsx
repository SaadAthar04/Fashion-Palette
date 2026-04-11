import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
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
      <div className="flex items-baseline gap-3">
        {hasDiscount ? (
          <>
            <span className="text-2xl md:text-3xl font-semibold text-sale">
              {formatPrice(product.salePrice!)}
            </span>
            <span className="text-base text-muted/50 line-through">
              {formatPrice(product.basePrice)}
            </span>
            <span className="text-[10px] font-semibold text-sale uppercase tracking-wider">
              Save{" "}
              {formatPrice(
                parseFloat(product.basePrice) -
                  parseFloat(product.salePrice!)
              )}
            </span>
          </>
        ) : (
          <span className="text-2xl md:text-3xl font-semibold">
            {formatPrice(product.basePrice)}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-border/50" />

      {/* SKU */}
      <p className="text-[11px] text-muted/60 tracking-wider">
        SKU: <span className="font-medium">{product.sku}</span>
      </p>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-[13px] text-muted leading-[1.8] font-light">
          {product.shortDescription}
        </p>
      )}

      {/* Fabric & Occasion */}
      <div className="grid grid-cols-2 gap-3">
        {product.fabric && (
          <div className="bg-surface px-4 py-3.5">
            <p className="text-[10px] text-muted/60 uppercase tracking-[0.2em] mb-1">
              Fabric
            </p>
            <p className="text-[13px] font-medium">{product.fabric}</p>
          </div>
        )}
        {product.occasion && (
          <div className="bg-surface px-4 py-3.5">
            <p className="text-[10px] text-muted/60 uppercase tracking-[0.2em] mb-1">
              Occasion
            </p>
            <p className="text-[13px] font-medium">{product.occasion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
