import type { CSSProperties } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartItem, removeCartItem } from "../api/cart";
import { queryKeys } from "../hooks/queries/useCatalogQueries";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useCartStore } from "../stores/cartStore";
import { formatPriceTHB } from "../utils/format";
import { resolveImageUrl } from "../utils/image";
import placeholderImage from "../assets/KEYWERK_Preview.png";

function Cart() {
  const { cart, loading, refreshCart } = useCartStore();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      updateCartItem(cartItemId, quantity),
    onSuccess: () => {
      refreshCart();
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (cartItemId: string) => removeCartItem(cartItemId),
    onSuccess: () => {
      refreshCart();
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });

  const handleQuantityChange = (e: React.MouseEvent, cartItemId: string, quantity: number) => {
    e.preventDefault();
    if (quantity < 1) return;
    updateMutation.mutate({ cartItemId, quantity });
  };

  const handleRemove = (e: React.MouseEvent, cartItemId: string) => {
    e.preventDefault();
    removeMutation.mutate(cartItemId);
  };

  return (
    <>
      <Navbar />
      <section
        style={{
          background: "var(--bg)",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          boxSizing: "border-box",
          padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 64px)",
          minHeight: "60vh",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 40px)",
              color: "var(--text)",
              margin: "0 0 32px",
            }}
          >
            ตะกร้าสินค้า
          </h1>

          {loading && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-dim)" }}>
              กำลังโหลดตะกร้า...
            </p>
          )}

          {!loading && (!cart || cart.items.length === 0) && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-dim)" }}>
              ตะกร้าว่าง — เลือกสินค้าแล้วเพิ่มลงตะกร้าได้จากหน้ารายละเอียดสินค้า
            </p>
          )}

          {!loading && cart && cart.items.length > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {cart.items.map((item) => (
                  <div
                    key={item.cartitem_id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "96px 1fr auto",
                      gap: 20,
                      alignItems: "center",
                      padding: 16,
                      borderRadius: 12,
                      border: "1px solid var(--line)",
                      background: "var(--surface)",
                    }}
                  >
                    <img
                      src={resolveImageUrl(item.image_url) || placeholderImage}
                      alt={item.product_name}
                      style={{
                        width: 96,
                        height: 96,
                        objectFit: "cover",
                        borderRadius: 8,
                        background: "#0a0906",
                      }}
                    />

                    <div>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          color: "var(--text)",
                        }}
                      >
                        {item.product_name}
                      </p>
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 13,
                          color: "var(--text-dim)",
                        }}
                      >
                        {item.variant_name}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          color: "var(--accent)",
                        }}
                      >
                        {formatPriceTHB(item.price)}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          type="button"
                          onClick={(e) => handleQuantityChange(e, item.cartitem_id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateMutation.isPending}
                          style={qtyButtonStyle}
                        >
                          −
                        </button>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            minWidth: 24,
                            textAlign: "center",
                            color: "var(--text)",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleQuantityChange(e, item.cartitem_id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock || updateMutation.isPending}
                          style={qtyButtonStyle}
                        >
                          +
                        </button>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          color: "var(--text)",
                        }}
                      >
                        {formatPriceTHB(item.subtotal)}
                      </p>

                      <button
                        type="button"
                        onClick={(e) => handleRemove(e, item.cartitem_id)}
                        disabled={removeMutation.isPending}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#e85d5d",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 32,
                  paddingTop: 24,
                  borderTop: "1px solid var(--line)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "var(--text-dim)",
                  }}
                >
                  {cart.total_items} ชิ้น
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "var(--accent)",
                  }}
                >
                  รวม {formatPriceTHB(cart.total_price)}
                </span>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

const qtyButtonStyle: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: "1px solid var(--line)",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "'JetBrains Mono', monospace",
  cursor: "pointer",
};

export default Cart;
