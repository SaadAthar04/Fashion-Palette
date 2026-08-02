"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, ShieldCheck } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { cn, formatPrice, getImageUrl } from "@/lib/utils";
import { useDeliveryConfig } from "@/hooks/useDeliveryConfig";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCart();
  const { deliveryCharge, freeThreshold } = useDeliveryConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const deliveryCharges = subtotal >= freeThreshold ? 0 : deliveryCharge;
  const total = subtotal + deliveryCharges;
  const remaining = freeThreshold - subtotal;

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "Shopping Cart" }]} className="mb-8" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="w-20 h-20 text-border mb-6" />
          <h1 className="text-2xl md:text-3xl font-bold mb-3">Your Cart is Empty</h1>
          <p className="text-muted max-w-md mb-8">
            Looks like you haven&apos;t added anything to your shopping bag yet.
            Browse our collections and find something you love.
          </p>
          <Link href="/">
            <Button variant="primary" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Shopping Cart" }]} className="mb-8" />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          Shopping Cart
          <span className="text-muted text-lg font-normal ml-2">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-muted hover:text-sale transition-colors underline underline-offset-2"
        >
          Clear Cart
        </button>
      </div>

      {/* Free delivery progress bar */}
      {remaining > 0 && (
        <div className="mb-8 p-4 bg-surface rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-accent" />
            <p className="text-sm">
              Add <span className="font-semibold text-accent">{formatPrice(remaining)}</span> more
              for <span className="font-semibold">free delivery!</span>
            </p>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((subtotal / freeThreshold) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-3 lg:gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {/* Desktop table header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 pb-4 border-b border-border text-xs uppercase tracking-wider text-muted font-semibold">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="divide-y divide-border">
            {items.map((item) => {
              const price = item.product.salePrice
                ? parseFloat(item.product.salePrice)
                : parseFloat(item.product.basePrice);
              const adjustment = item.variant
                ? parseFloat(item.variant.priceAdjustment)
                : 0;
              const unitPrice = price + adjustment;
              const lineTotal = unitPrice * item.quantity;
              const primaryImage = item.product.images?.[0]?.imageUrl;

              return (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="py-6"
                >
                  {/* Mobile layout */}
                  <div className="flex gap-4 md:hidden">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="w-24 h-28 bg-surface flex-shrink-0 relative overflow-hidden rounded-lg"
                    >
                      <Image
                        src={getImageUrl(primaryImage)}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                      {item.product.salePrice && (
                        <span className="absolute top-1 left-1 bg-sale text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                          Sale
                        </span>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted uppercase tracking-wide">
                        {item.product.brand?.name}
                      </p>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm font-medium hover:text-accent transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-muted mt-0.5">
                          {item.variant.size && `Size: ${item.variant.size}`}
                          {item.variant.size && item.variant.color && " | "}
                          {item.variant.color && `Color: ${item.variant.color}`}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold">
                          {formatPrice(unitPrice)}
                        </span>
                        {item.product.salePrice && (
                          <span className="text-xs text-muted line-through">
                            {formatPrice(item.product.basePrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity - 1
                              )
                            }
                            className="p-2 hover:bg-surface transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity + 1
                              )
                            }
                            className="p-2 hover:bg-surface transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">
                            {formatPrice(lineTotal)}
                          </span>
                          <button
                            onClick={() =>
                              removeItem(item.productId, item.variantId)
                            }
                            className="p-1.5 text-muted hover:text-sale transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 flex gap-4">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="w-20 h-24 bg-surface flex-shrink-0 relative overflow-hidden rounded-lg"
                      >
                        <Image
                          src={getImageUrl(primaryImage)}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </Link>
                      <div className="min-w-0">
                        <p className="text-xs text-muted uppercase tracking-wide">
                          {item.product.brand?.name}
                        </p>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-sm font-medium hover:text-accent transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-muted mt-1">
                            {item.variant.size && `Size: ${item.variant.size}`}
                            {item.variant.size && item.variant.color && " | "}
                            {item.variant.color && `Color: ${item.variant.color}`}
                          </p>
                        )}
                        <button
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          className="flex items-center gap-1 text-xs text-muted hover:text-sale transition-colors mt-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-semibold">
                        {formatPrice(unitPrice)}
                      </span>
                      {item.product.salePrice && (
                        <span className="block text-xs text-muted line-through">
                          {formatPrice(item.product.basePrice)}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity - 1
                            )
                          }
                          className="p-2 hover:bg-surface transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity + 1
                            )
                          }
                          className="p-2 hover:bg-surface transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-bold">
                        {formatPrice(lineTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 pt-6 border-t border-border">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="mt-10 lg:mt-0">
          <div className="bg-surface rounded-xl p-6 lg:sticky lg:top-8">
            <h2 className="text-lg font-bold mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery Charges</span>
                <span
                  className={cn(
                    "font-medium",
                    deliveryCharges === 0 && "text-success"
                  )}
                >
                  {deliveryCharges === 0
                    ? "FREE"
                    : formatPrice(deliveryCharges)}
                </span>
              </div>
              {deliveryCharges === 0 && (
                <p className="text-xs text-success flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  You qualify for free delivery!
                </p>
              )}
              <div className="pt-3 mt-3 border-t border-border">
                <div className="flex justify-between text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted mt-1">
                  Inclusive of all taxes
                </p>
              </div>
            </div>

            <Link href="/checkout" className="block mt-6">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>

            {/* Trust Signals */}
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted">
                <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
                <span>Secure checkout with SSL encryption</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <Truck className="w-4 h-4 text-accent flex-shrink-0" />
                <span>
                  Free delivery on orders above {formatPrice(freeThreshold)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
