import { apiFetch } from "./client";
import type { Cart, MessageResponse, CartItem } from "./types";

export function getCart() {
  return apiFetch<Cart>("/cart");
}

export function addToCart(variantId: string, quantity: number) {
  return apiFetch<CartItem>("/cart/items", {
    method: "POST",
    body: JSON.stringify({ variant_id: variantId, quantity }),
  });
}

export function updateCartItem(cartItemId: string, quantity: number) {
  return apiFetch<MessageResponse>(`/cart/items/${cartItemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(cartItemId: string) {
  return apiFetch<MessageResponse>(`/cart/items/${cartItemId}`, {
    method: "DELETE",
  });
}

export function clearCart() {
  return apiFetch<MessageResponse>("/cart", {
    method: "DELETE",
  });
}
