"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { calculateDiscount, getImageUrl, cn } from "@/lib/utils";
import Price from "@/components/currency/Price";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
}

export default function ProductCard({
  product,
  showQuickView = true,
}: ProductCardProps) {
  const [loaded, setLoaded] = useState(false);
  const hasDiscount =
    product.salePrice &&
    parseFloat(product.salePrice) < parseFloat(product.basePrice);
  const discount = hasDiscount
    ? calculateDiscount(product.basePrice, product.salePrice!)
    : 0;
  const primaryImage = product.images?.[0]?.imageUrl;
  const secondImage = product.images?.[1]?.imageUrl;

  return (
    <div className="group relative">
      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-[3/4] overflow-hidden bg-surface"
      >
        {/* Skeleton shimmer until the image is fully decoded */}
        {!loaded && <span className="absolute inset-0 shimmer" aria-hidden />}

        {/* Primary Image — fades in when fully loaded (no half-render flash) */}
        <Image
          src={getImageUrl(primaryImage)}
          alt={product.name}
          fill
          onLoad={() => setLoaded(true)}
          className={cn(
            "object-cover object-top transition-all duration-700 ease-out group-hover:scale-[1.03]",
            loaded ? "opacity-100" : "opacity-0"
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Second Image (hover reveal) */}
        {secondImage && (
          <Image
            src={getImageUrl(secondImage)}
            alt={product.name}
            fill
            className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && <Badge variant="sale">-{discount}%</Badge>}
          {product.isNewArrival && <Badge variant="new">New</Badge>}
          {product.isBestSeller && (
            <Badge variant="trending">Best Seller</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-sale"
          aria-label="Add to wishlist"
        >
          <Heart className="w-[15px] h-[15px]" strokeWidth={1.5} />
        </button>

        {/* Quick Actions (Desktop hover) */}
        {showQuickView && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm py-3.5 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out hidden md:flex items-center justify-center gap-6">
            <button className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary hover:text-accent transition-colors duration-300">
              <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
              Add to Cart
            </button>
            <span className="w-[1px] h-3.5 bg-border" />
            <button className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary hover:text-accent transition-colors duration-300">
              <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
              Quick View
            </button>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="mt-4 space-y-1.5">
        <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-medium">
          {product.brand?.name}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-[13px] font-medium leading-snug line-clamp-2 hover:text-accent transition-colors duration-300">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2.5 pt-0.5">
          {hasDiscount ? (
            <>
              <Price pkr={product.salePrice!} className="text-sm font-semibold text-sale" showEst={false} />
              <Price pkr={product.basePrice} className="text-[11px] text-muted/60 line-through" showEst={false} />
            </>
          ) : (
            <Price pkr={product.basePrice} className="text-sm font-semibold" showEst={false} />
          )}
        </div>
      </div>
    </div>
  );
}
