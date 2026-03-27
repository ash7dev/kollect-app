'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type BrandCartItem = {
  productId: string;
  brandSlug: string;
  brandName?: string;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  quantity: number;
  stock?: number | null;
  // Variants
  selectedSize?: string | null;
  selectedColor?: string | null;
  availableSizes?: string[];
  availableColors?: string[];
};

type BrandCartState = {
  itemsByBrand: Record<string, BrandCartItem[]>;

  addItem: (item: Omit<BrandCartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (brandSlug: string, productId: string) => void;
  setQuantity: (brandSlug: string, productId: string, quantity: number) => void;
  updateVariant: (brandSlug: string, productId: string, selectedSize?: string | null, selectedColor?: string | null) => void;
  clearBrand: (brandSlug: string) => void;
  clearAll: () => void;

  getItems: (brandSlug: string) => BrandCartItem[];
  getTotalQuantity: (brandSlug: string) => number;
  getSubtotal: (brandSlug: string) => number;
  getTotalGlobalCount: () => number;
  getActiveBrandInfo: () => { slug: string; name: string } | null;

  // UI state
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.floor(quantity));
}

export const useBrandCartStore = create<BrandCartState>()(
  persist(
    (set, get) => ({
      itemsByBrand: {},

      addItem: (item) => {
        const quantityToAdd = clampQuantity(item.quantity ?? 1);
        set((state) => {
          const brandItems = state.itemsByBrand[item.brandSlug] ?? [];
          const idx = brandItems.findIndex((x) => x.productId === item.productId);

          if (idx >= 0) {
            const next = [...brandItems];
            const existing = next[idx];
            const nextQty = existing.stock ? Math.min(existing.stock, existing.quantity + quantityToAdd) : existing.quantity + quantityToAdd;
            next[idx] = { ...existing, quantity: Math.max(1, nextQty) };
            return {
              itemsByBrand: {
                ...state.itemsByBrand,
                [item.brandSlug]: next,
              },
            };
          }

          const toAdd: BrandCartItem = {
            ...item,
            quantity: quantityToAdd,
          };

          const capped = toAdd.stock ? { ...toAdd, quantity: Math.min(toAdd.stock, toAdd.quantity) } : toAdd;

          return {
            itemsByBrand: {
              ...state.itemsByBrand,
              [item.brandSlug]: [...brandItems, capped],
            },
          };
        });
      },

      removeItem: (brandSlug, productId) => {
        set((state) => {
          const brandItems = state.itemsByBrand[brandSlug] ?? [];
          return {
            itemsByBrand: {
              ...state.itemsByBrand,
              [brandSlug]: brandItems.filter((x) => x.productId !== productId),
            },
          };
        });
      },

      setQuantity: (brandSlug, productId, quantity) => {
        const q = clampQuantity(quantity);
        set((state) => {
          const brandItems = state.itemsByBrand[brandSlug] ?? [];
          const idx = brandItems.findIndex((x) => x.productId === productId);
          if (idx < 0) return state;

          const next = [...brandItems];
          const existing = next[idx];
          const capped = existing.stock ? Math.min(existing.stock, q) : q;
          next[idx] = { ...existing, quantity: Math.max(1, capped) };

          return {
            itemsByBrand: {
              ...state.itemsByBrand,
              [brandSlug]: next,
            },
          };
        });
      },

      updateVariant: (brandSlug, productId, selectedSize, selectedColor) => {
        set((state) => {
          const brandItems = state.itemsByBrand[brandSlug] ?? [];
          const idx = brandItems.findIndex((x) => x.productId === productId);
          if (idx < 0) return state;
          const next = [...brandItems];
          next[idx] = {
            ...next[idx],
            ...(selectedSize !== undefined ? { selectedSize } : {}),
            ...(selectedColor !== undefined ? { selectedColor } : {}),
          };
          return { itemsByBrand: { ...state.itemsByBrand, [brandSlug]: next } };
        });
      },

      clearBrand: (brandSlug) => {
        set((state) => {
          const next = { ...state.itemsByBrand };
          delete next[brandSlug];
          return { itemsByBrand: next };
        });
      },

      clearAll: () => set({ itemsByBrand: {} }),

      getItems: (brandSlug) => {
        const itemsByBrand = get().itemsByBrand;
        return itemsByBrand[brandSlug] ?? [];
      },
      getTotalQuantity: (brandSlug) => {
        const items = get().itemsByBrand[brandSlug] ?? [];
        return items.reduce((sum, x) => sum + x.quantity, 0);
      },
      getSubtotal: (brandSlug) => {
        const items = get().itemsByBrand[brandSlug] ?? [];
        return items.reduce((sum, x) => sum + x.quantity * x.price, 0);
      },
      getTotalGlobalCount: () => {
        const { itemsByBrand } = get();
        return Object.values(itemsByBrand).reduce(
          (sum, items) => sum + items.reduce((s, x) => s + x.quantity, 0),
          0,
        );
      },
      getActiveBrandInfo: () => {
        const { itemsByBrand } = get();
        const entry = Object.entries(itemsByBrand).find(([, items]) => items.length > 0);
        if (!entry) return null;
        const [slug, items] = entry;
        return { slug, name: items[0]?.brandName ?? slug };
      },

      cartOpen: false,
      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
      toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
    }),
    {
      name: 'kollect_brand_cart_v1',
      // Evite les mismatch SSR/CSR sur les composants qui rendent le contenu du panier
      // (SSR = panier vide car pas de localStorage, CSR = localStorage non vide).
      // On déclenche ensuite la rehydratation explicitement côté client après montage.
      skipHydration: true,
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          } as unknown as Storage;
        }
        return localStorage;
      }),
      partialize: (state) => ({ itemsByBrand: state.itemsByBrand, cartOpen: false }),
    },
  ),
);

