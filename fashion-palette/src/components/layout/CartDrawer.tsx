"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import { useCart } from "@/hooks/useCart";
import { getImageUrl } from "@/lib/utils";
import Price from "@/components/currency/Price";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/constants";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getSubtotal } = useCart();
  const subtotal = getSubtotal();
  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Shopping Bag (${items.length})`}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
          <ShoppingBag
            className="w-14 h-14 text-border mb-5"
            strokeWidth={1}
          />
          <h3 className="text-base font-semibold mb-2">Your bag is empty</h3>
          <p className="text-[13px] text-muted/60 mb-8">
            Looks like you haven&apos;t added anything yet.
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] bg-accent text-white hover:bg-accent-hover transition-colors duration-300"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Free delivery progress */}
          {remaining > 0 && (
            <div className="px-6 py-3.5 bg-surface/50 border-b border-border/20">
              <p className="text-[11px] text-muted text-center tracking-wide">
                Add{" "}
                <span className="font-semibold text-accent">
                  <Price pkr={remaining} showEst={false} />
                </span>{" "}
                more for free delivery
              </p>
              <div className="mt-2 h-[2px] bg-border/30 overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{
                    width: `${Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {items.map((item) => {
              let price = item.product.salePrice
                ? parseFloat(item.product.salePrice)
                : parseFloat(item.product.basePrice);
              if (item.variant?.priceAdjustment) {
                price += parseFloat(item.variant.priceAdjustment);
              }
              const primaryImage =
                item.product.images?.find((img) => img.isPrimary)?.imageUrl ||
                item.product.images?.[0]?.imageUrl;

              return (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 pb-5 border-b border-border/20 last:border-0"
                >
                  <div className="w-20 h-24 bg-surface flex-shrink-0 relative overflow-hidden">
                    <Image
                      src={getImageUrl(primaryImage)}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted/50 uppercase tracking-[0.15em]">
                      {item.product.brand?.name}
                    </p>
                    <h4 className="text-[13px] font-medium truncate mt-0.5">
                      {item.product.name}
                    </h4>
                    {item.variant && (
                      <p className="text-[11px] text-muted/50 mt-0.5">
                        {item.variant.size && `Size: ${item.variant.size}`}
                        {item.variant.color &&
                          ` | Color: ${item.variant.color}`}
                      </p>
                    )}
                    <p className="text-[13px] font-semibold mt-1.5">
                      <Price pkr={price} showEst={false} />
                    </p>

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-border/40">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity - 1
                            )
                          }
                          className="p-1.5 hover:bg-surface transition-colors duration-200"
                        >
                          <Minus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                        <span className="px-3 text-[12px] font-medium tabular-nums">
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
                          className="p-1.5 hover:bg-surface transition-colors duration-200"
                        >
                          <Plus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          removeItem(item.productId, item.variantId)
                        }
                        className="p-1.5 text-muted/40 hover:text-sale transition-colors duration-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-border/20 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-muted">
                Subtotal
              </span>
              <span className="text-base font-semibold">
                <Price pkr={subtotal} showEst={false} />
              </span>
            </div>
            <p className="text-[10px] text-muted/40 tracking-wide">
              Delivery charges calculated at checkout
            </p>
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full text-center px-6 py-3.5 bg-accent text-white text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-accent-hover transition-colors duration-300"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="block w-full text-center px-6 py-3.5 border border-border/30 text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-surface transition-colors duration-300"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
