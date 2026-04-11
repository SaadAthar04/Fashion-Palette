"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductVariant } from "@/types";

export type CartItem = {
  productId: number;
  variantId: number | null;
  quantity: number;
  product: Product;
  variant: ProductVariant | null;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, variant: ProductVariant | null, quantity?: number) => void;
  removeItem: (productId: number, variantId: number | null) => void;
  updateQuantity: (productId: number, variantId: number | null, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (product, variant, quantity = 1) => {
        const items = get().items;
        const existing = items.find(
          (item) => item.productId === product.id && item.variantId === (variant?.id ?? null)
        );

        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === product.id && item.variantId === (variant?.id ?? null)
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [
              ...items,
              { productId: product.id, variantId: variant?.id ?? null, quantity, product, variant },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        });
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, item) => {
          const price = item.product.salePrice
            ? parseFloat(item.product.salePrice)
            : parseFloat(item.product.basePrice);
          const adjustment = item.variant ? parseFloat(item.variant.priceAdjustment) : 0;
          return sum + (price + adjustment) * item.quantity;
        }, 0),
    }),
    {
      name: "fashion-palette-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
