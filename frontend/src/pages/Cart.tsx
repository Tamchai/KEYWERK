import type { CSSProperties, MouseEvent } from "react";
import { Link } from "react-router-dom";
import placeholderImage from "../assets/KEYWERK_Preview.png";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import { useConfirmDialog } from "../components/ui/dialog-context";
import { useCartStore } from "../stores/cartStore";
import { formatPriceTHB } from "../utils/format";
import { resolveImageUrl } from "../utils/image";

function Cart() {
  const { cart, loading, error, updateItem, removeItem, clearCart } = useCartStore();
  const confirmDialog = useConfirmDialog();

  const changeQuantity = (event: MouseEvent, cartItemId: string, quantity: number) => {
    event.preventDefault();
    if (quantity < 1) return;
    void updateItem(cartItemId, quantity).catch(() => undefined);
  };

  const remove = async (event: MouseEvent, cartItemId: string) => {
    event.preventDefault();
    const confirmed = await confirmDialog({
      title: "นำสินค้าออกจากตะกร้า",
      description: "สินค้ารายการนี้จะถูกนำออกจากตะกร้าของคุณ",
      confirmLabel: "นำออก",
      destructive: true,
    });
    if (confirmed) await removeItem(cartItemId).catch(() => undefined);
  };

  const clear = async () => {
    const confirmed = await confirmDialog({
      title: "ล้างตะกร้าสินค้า",
      description: "สินค้าทุกรายการในตะกร้าจะถูกนำออก",
      confirmLabel: "ล้างตะกร้า",
      destructive: true,
    });
    if (confirmed) await clearCart().catch(() => undefined);
  };

  const hasItems = Boolean(cart?.items.length);
  const isInitialLoading = cart === null && !error;

  return (
    <>
      <Navbar />
      <main style={pageStyle}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={headingStyle}>ตะกร้าสินค้า</h1>
          {loading ? <p>กำลังอัปเดตตะกร้า...</p> : null}
          {error ? <p style={{ color: "#e85d5d" }}>{error}</p> : null}
          {!loading && !isInitialLoading && !hasItems ? <p>ตะกร้าว่าง — เลือกสินค้าและเพิ่มลงตะกร้าได้จากหน้ารายละเอียดสินค้า</p> : null}

          {hasItems ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {cart!.items.map((item) => (
                  <article key={item.cartitem_id} style={itemStyle}>
                    <img src={resolveImageUrl(item.image_url) || placeholderImage} alt={item.product_name} style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 8 }} />
                    <div>
                      <strong>{item.product_name}</strong>
                      <p style={{ color: "var(--text-dim)" }}>{item.variant_name}</p>
                      <strong style={{ color: "var(--accent)" }}>{formatPriceTHB(item.price)}</strong>
                      {item.quantity > item.stock ? <p style={{ color: "#e85d5d" }}>สินค้าเหลือ {item.stock} ชิ้น กรุณาลดจำนวนก่อนชำระเงิน</p> : null}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button type="button" aria-label="ลดจำนวน" onClick={(event) => changeQuantity(event, item.cartitem_id, item.quantity - 1)} disabled={item.quantity <= 1 || loading} style={qtyButtonStyle}>−</button>
                        <span>{item.quantity}</span>
                        <button type="button" aria-label="เพิ่มจำนวน" onClick={(event) => changeQuantity(event, item.cartitem_id, item.quantity + 1)} disabled={item.quantity >= item.stock || loading} style={qtyButtonStyle}>+</button>
                      </div>
                      <strong>{formatPriceTHB(item.subtotal)}</strong>
                      <button type="button" onClick={(event) => remove(event, item.cartitem_id)} disabled={loading} style={{ color: "#e85d5d" }}>ลบ</button>
                    </div>
                  </article>
                ))}
              </div>

              <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between" }}>
                <span>{cart!.total_items} ชิ้น</span>
                <strong style={{ color: "var(--accent)", fontSize: 22 }}>รวม {formatPriceTHB(cart!.total_price)}</strong>
              </div>
              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button style={{display: "inline-block", padding: "12px 20px", borderRadius: 8}} type="button" disabled={loading} onClick={() => void clear()}>ล้างตะกร้า</button>
                <Link to="/checkout" aria-disabled={loading || cart!.items.some((item) => item.quantity > item.stock)} style={{ ...checkoutStyle, pointerEvents: loading || cart!.items.some((item) => item.quantity > item.stock) ? "none" : "auto", opacity: loading ? 0.6 : 1 }}>ดำเนินการสั่งซื้อ</Link>
              </div>
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}

const pageStyle: CSSProperties = { background: "var(--bg)", width: "100vw", marginLeft: "calc(50% - 50vw)", minHeight: "60vh", padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 64px)", boxSizing: "border-box" };
const headingStyle: CSSProperties = { fontFamily: "var(--font-sans)", fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 32 };
const itemStyle: CSSProperties = { display: "grid", gridTemplateColumns: "96px minmax(0, 1fr) auto", gap: 20, alignItems: "center", padding: 16, borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)" };
const qtyButtonStyle: CSSProperties = { width: 30, height: 30, borderRadius: 6, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", cursor: "pointer" };
const checkoutStyle: CSSProperties = { display: "inline-block", padding: "12px 20px", borderRadius: 8, background: "var(--accent)", color: "var(--bg)", fontWeight: 800, textDecoration: "none" };

export default Cart;
