import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";
import { getSessionCartAction } from "../../utils/sessionCartSync";

export default function SessionSync() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const resetCart = useCartStore((state) => state.resetCart);
  const refreshCart = useCartStore((state) => state.refreshCart);
  const queryClient = useQueryClient();
  const hasSyncedCart = useRef(false);

  useEffect(() => {
    const action = getSessionCartAction(hasHydrated, isLoggedIn, hasSyncedCart.current);
    if (action === "refresh") {
      hasSyncedCart.current = true;
      void refreshCart();
    }
    if (action === "reset") {
      hasSyncedCart.current = false;
      resetCart();
      queryClient.removeQueries({ queryKey: ["commerce"] });
    }
  }, [hasHydrated, isLoggedIn, queryClient, refreshCart, resetCart]);

  return null;
}
