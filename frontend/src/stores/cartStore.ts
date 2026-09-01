import { create } from "zustand";
import { getCart, addToCart as apiAddToCart } from "../api/cart";
import type { Cart, CartItem } from "../api/types";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  setCart: (cart: Cart | null) => void;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
  addToCart: (variantId: string, quantity: number) => Promise<CartItem>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,

  setCart: (cart) => set({ cart }),

  refreshCart: async () => {
    set({ loading: true });
    try {
      const data = await getCart();
      set({ cart: data });
    } catch {
      set({ cart: null });
    } finally {
      set({ loading: false });
    }
  },

  clearCart: () => set({ cart: null }),

  addToCart: async (variantId: string, quantity: number) => {
    const newItem = await apiAddToCart(variantId, quantity);
    await get().refreshCart();
    return newItem;
  },
}));
