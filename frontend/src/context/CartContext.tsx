import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";

// Re-export for backwards compatibility — components can still use useCart()
export function useCart() {
  const { isLoggedIn } = useAuthStore();
  const { cart, loading, refreshCart, resetCart } = useCartStore();

  useEffect(() => {
    if (isLoggedIn) {
      refreshCart();
    } else {
      resetCart();
    }
  }, [isLoggedIn, refreshCart, resetCart]);

  return {
    cart,
    cartCount: cart?.total_items ?? 0,
    loading,
    refreshCart,
  };
}
