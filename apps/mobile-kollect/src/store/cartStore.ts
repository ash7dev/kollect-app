import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

// Import web fallback
import { getItemAsync as webGetItemAsync, setItemAsync as webSetItemAsync } from '../../secureStore.web';

export type CartItem = {
  productId: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  brandId: string;
  brandSlug?: string;
  size?: string;
  color?: string;
  stock?: number;
};

export type OrderCustomerInfo = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  additionalInfo?: string;
};

type CartState = {
  items: CartItem[];
  customer?: OrderCustomerInfo;
  currentBrandId: string | null;

  addItem: (
    item: Omit<CartItem, 'quantity'> & { quantity?: number },
    onBrandConflict?: (newBrandName: string, currentBrandName: string) => Promise<boolean>
  ) => Promise<void>;
  removeItem: (productId: string, variant?: { size?: string; color?: string }) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variant?: { size?: string; color?: string }
  ) => void;
  clear: () => void;
  setCustomer: (info: OrderCustomerInfo) => void;
  clearCustomer: () => void;
  totalQuantity: () => number;
  subtotal: () => number;
  groupByBrand: () => Record<string, CartItem[]>;
};

function isSameVariant(a?: { size?: string; color?: string }, b?: { size?: string; color?: string }) {
  return (a?.size || '') === (b?.size || '') && (a?.color || '') === (b?.color || '');
}

// Custom storage implementation for Zustand persist with SecureStore
const storage = {
  getItem: async (name: string) => {
    try {
      const value = await SecureStore.getItemAsync(name);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('Error getting item from storage, falling back to web storage', e);
      try {
        const value = await webGetItemAsync(name);
        return value ? JSON.parse(value) : null;
      } catch (webError) {
        console.error('Error getting item from web storage', webError);
        return null;
      }
    }
  },
  setItem: async (name: string, value: any) => {
    try {
      await SecureStore.setItemAsync(name, JSON.stringify(value));
    } catch (e) {
      console.error('Error setting item in storage, falling back to web storage', e);
      try {
        await webSetItemAsync(name, JSON.stringify(value));
      } catch (webError) {
        console.error('Error setting item in web storage', webError);
      }
    }
  },
  removeItem: async (name: string) => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (e) {
      console.error('Error removing item from storage, falling back to web storage', e);
      try {
        // Web fallback implementation
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(name);
        }
      } catch (webError) {
        console.error('Error removing item from web storage', webError);
      }
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: undefined,
      currentBrandId: null,

      addItem: async (payload, onBrandConflict) => {
        const quantity = Math.max(1, payload.quantity ?? 1);
        const state = get();
        
        // Vérifier si le panier contient déjà des articles d'une autre marque
        if (state.currentBrandId && state.currentBrandId !== payload.brandId) {
          if (onBrandConflict) {
            const shouldProceed = await onBrandConflict(
              payload.brandSlug || 'cette marque',
              state.items[0]?.brandSlug || 'votre panier'
            );
            if (!shouldProceed) return; // L'utilisateur a annulé
          }
          
          // Si on arrive ici, on vide le panier et on définit la nouvelle marque
          set({
            items: [],
            currentBrandId: payload.brandId
          });
        } else if (!state.currentBrandId) {
          // Premier article ajouté au panier
          set({ currentBrandId: payload.brandId });
        }

        // Ajout de l'article
        set((state) => {
          const existingIndex = state.items.findIndex(
            (it) =>
              it.productId === payload.productId &&
              isSameVariant(it, payload)
          );
          
          if (existingIndex >= 0) {
            const updated = [...state.items];
            const target = updated[existingIndex];
            const newQty = target.quantity + quantity;
            updated[existingIndex] = {
              ...target,
              quantity: target.stock ? Math.min(newQty, target.stock) : newQty,
            };
            return { items: updated };
          }
          
          const newItem: CartItem = {
            productId: payload.productId,
            name: payload.name,
            image: payload.image ?? null,
            price: payload.price,
            quantity: payload.stock ? Math.min(quantity, payload.stock) : quantity,
            brandId: payload.brandId,
            brandSlug: payload.brandSlug,
            size: payload.size,
            color: payload.color,
            stock: payload.stock,
          };
          
          return { 
            items: [newItem, ...state.items]
          };
        });
      },

      removeItem: (productId, variant) => {
        set((state) => ({
          items: state.items.filter(
            (it) => !(it.productId === productId && isSameVariant(it, variant))
          ),
        }));
      },

      updateQuantity: (productId, quantity, variant) => {
        set((state) => {
          const updated = state.items.map((item) => {
            if (item.productId === productId && isSameVariant(item, variant)) {
              return {
                ...item,
                quantity: item.stock ? Math.min(quantity, item.stock) : quantity,
              };
            }
            return item;
          });
          return { items: updated };
        });
      },

      clear: () => {
        set({ items: [], currentBrandId: null });
      },

      setCustomer: (info) => set({ customer: info }),
      clearCustomer: () => set({ customer: undefined }),

      totalQuantity: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      groupByBrand: () => {
        return get().items.reduce<Record<string, CartItem[]>>((acc, it) => {
          const key = it.brandId;
          if (!acc[key]) acc[key] = [];
          acc[key].push(it);
          return acc;
        }, {});
      },
    }),
    {
      name: 'cart-storage',
      storage: storage,
      // Zustand persistera automatiquement les propriétés de l'état
    })
);