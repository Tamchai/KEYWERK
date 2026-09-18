import { create } from "zustand";
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from "../api/cart";
import type { Cart } from "../api/types";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  setCart: (cart: Cart | null) => void;
  refreshCart: () => Promise<void>;
  resetCart: () => void;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  updateItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

let refreshSequence = 0;

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  setCart: (cart) => set({ cart }),

  refreshCart: async () => {
	const sequence = ++refreshSequence;
    set({ loading: true, error: null });
    try {
      const data = await getCart();
	  if (sequence === refreshSequence) set({ cart: data });
    } catch (error) {
	  if (sequence === refreshSequence) {
		set({ cart: null, error: error instanceof Error ? error.message : "โหลดตะกร้าไม่สำเร็จ" });
	  }
    } finally {
	  if (sequence === refreshSequence) set({ loading: false });
    }
  },

  resetCart: () => {
	refreshSequence += 1;
	set({ cart: null, error: null, loading: false });
  },

  addToCart: async (variantId: string, quantity: number) => {
    set({ loading: true, error: null });
    try {
      await apiAddToCart(variantId, quantity);
      await get().refreshCart();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "เพิ่มสินค้าไม่สำเร็จ", loading: false });
      throw error;
    }
  },

  updateItem: async (cartItemId, quantity) => {
    set({ loading: true, error: null });
    try {
      await apiUpdateCartItem(cartItemId, quantity);
      await get().refreshCart();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "แก้จำนวนสินค้าไม่สำเร็จ", loading: false });
      throw error;
    }
  },

  removeItem: async (cartItemId) => {
    set({ loading: true, error: null });
    try {
      await apiRemoveCartItem(cartItemId);
      await get().refreshCart();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "ลบสินค้าไม่สำเร็จ", loading: false });
      throw error;
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      await apiClearCart();
      await get().refreshCart();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "ล้างตะกร้าไม่สำเร็จ", loading: false });
      throw error;
    }
  },
}));
