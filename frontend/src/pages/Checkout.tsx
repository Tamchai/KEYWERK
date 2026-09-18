import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { AddressPayload, CreateOrderPayload } from "../api/types";
import AccountShell from "../components/account/AccountShell";
import { button, input, panel } from "../components/account/accountStyles";
import { useProductVariantsQuery } from "../hooks/queries/useCatalogQueries";
import { useAddressesQuery, useCreateOrder } from "../hooks/queries/useCommerceQueries";
import { useCartStore } from "../stores/cartStore";
import { formatPriceTHB } from "../utils/format";

const emptyAddress: AddressPayload = {
  title: "",
  receiver_name: "",
  phone_number: "",
  address_line1: "",
  address_line2: "",
  district: "",
  province: "",
  postal_code: "",
  is_default: false,
};

const addressFields: Array<[keyof AddressPayload, string, boolean]> = [
  ["receiver_name", "ชื่อผู้รับ", true],
  ["phone_number", "เบอร์โทร", true],
  ["address_line1", "ที่อยู่", true],
  ["address_line2", "รายละเอียดเพิ่มเติม", false],
  ["district", "เขต/อำเภอ", true],
  ["province", "จังหวัด", true],
  ["postal_code", "รหัสไปรษณีย์", true],
];

export default function Checkout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const cart = useCartStore((state) => state.cart);
  const refreshCart = useCartStore((state) => state.refreshCart);
  const variantId = params.get("variant");
  const quantity = Math.max(1, Number(params.get("quantity")) || 1);
  const isDirect = Boolean(variantId);
  const { addressesQuery } = useAddressesQuery();
  const variantsQuery = useProductVariantsQuery(isDirect);
  const createOrder = useCreateOrder();
  const [addressMode, setAddressMode] = useState<"saved" | "new">("saved");
  const [addressId, setAddressId] = useState("");
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [shipping, setShipping] = useState("Kerry Express");
  const selectedAddressId = addressId || addressesQuery.data?.find((address) => address.is_default)?.address_id || addressesQuery.data?.[0]?.address_id || "";
  const directVariant = variantsQuery.data?.find((variant) => variant.variant_id === variantId);
  const hasValidCart = Boolean(cart?.items.length) && !cart?.items.some((item) => item.quantity > item.stock);
  const directIsValid = Boolean(directVariant && directVariant.stock >= quantity);

  const setAddressField = (key: keyof AddressPayload, value: string) => {
    setNewAddress((current) => ({ ...current, [key]: value }));
  };

  const placeOrder = (event: FormEvent) => {
    event.preventDefault();
    const payload: CreateOrderPayload = {
      shipping_method: shipping,
      items: variantId ? [{ variant_id: variantId, quantity }] : [],
    };

    if (addressMode === "saved") {
      payload.address_id = selectedAddressId;
    } else {
      payload.receiver_name = newAddress.receiver_name.trim();
      payload.phone_number = newAddress.phone_number.trim();
      payload.address_line1 = newAddress.address_line1.trim();
      payload.address_line2 = newAddress.address_line2.trim();
      payload.district = newAddress.district.trim();
      payload.province = newAddress.province.trim();
      payload.postal_code = newAddress.postal_code.trim();
    }

    createOrder.mutate(payload, {
      onSuccess: async (order) => {
        if (!isDirect) await refreshCart();
        navigate(`/orders/${order.order_id}`);
      },
    });
  };

  if (!isDirect && !cart?.items.length) {
    return <AccountShell title="ยืนยันคำสั่งซื้อ"><p>ไม่มีสินค้าในตะกร้า</p></AccountShell>;
  }

  return (
    <AccountShell title="ยืนยันคำสั่งซื้อ">
      <form onSubmit={placeOrder}>
        <section style={{ ...panel, marginBottom: 16 }}>
          <h2>1. รายการสินค้า</h2>
          {isDirect ? (
            variantsQuery.isLoading ? <p>กำลังโหลดสินค้า...</p> : directVariant ? (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span>{directVariant.variant_name} × {quantity}</span>
                <strong>{formatPriceTHB(directVariant.price * quantity)}</strong>
              </div>
            ) : <p style={{ color: "#e85d5d" }}>ไม่พบตัวเลือกสินค้าที่ต้องการ</p>
          ) : cart?.items.map((item) => (
            <div key={item.cartitem_id} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 8 }}>
              <span>{item.product_name} · {item.variant_name} × {item.quantity}</span>
              <strong>{formatPriceTHB(item.subtotal)}</strong>
            </div>
          ))}
          {isDirect && directVariant && directVariant.stock < quantity ? <p style={{ color: "#e85d5d" }}>สินค้าเหลือเพียง {directVariant.stock} ชิ้น</p> : null}
        </section>

        <section style={{ ...panel, marginBottom: 16 }}>
          <h2>2. ที่อยู่จัดส่ง</h2>
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            <label><input type="radio" checked={addressMode === "saved"} onChange={() => setAddressMode("saved")} /> ใช้ที่อยู่ที่บันทึกไว้</label>
            <label><input type="radio" checked={addressMode === "new"} onChange={() => setAddressMode("new")} /> กรอกที่อยู่ใหม่</label>
          </div>
          {addressMode === "saved" ? (
            addressesQuery.isLoading ? <p>กำลังโหลดที่อยู่...</p> : addressesQuery.data?.length ? (
              <select aria-label="ที่อยู่จัดส่ง" style={{ width: "100%", padding: 12, background: "var(--bg)", color: "var(--text)" }} value={selectedAddressId} onChange={(event) => setAddressId(event.target.value)}>
                {addressesQuery.data.map((address) => (
                  <option key={address.address_id} value={address.address_id}>{address.receiver_name} — {address.address_line1}, {address.province}</option>
                ))}
              </select>
            ) : <p>ยังไม่มีที่อยู่ที่บันทึกไว้ กรุณา <Link to="/addresses">เพิ่มที่อยู่</Link> หรือเลือก “กรอกที่อยู่ใหม่”</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
              {addressFields.map(([key, label, required]) => (
                <input key={key} style={input} required={required} aria-label={label} placeholder={label} value={String(newAddress[key])} onChange={(event) => setAddressField(key, event.target.value)} />
              ))}
            </div>
          )}
          {addressesQuery.isError ? <p style={{ color: "#e85d5d" }}>{addressesQuery.error.message}</p> : null}
        </section>

        <section style={{ ...panel, marginBottom: 16 }}>
          <h2>3. วิธีจัดส่ง</h2>
          <select aria-label="วิธีจัดส่ง" style={{ width: "100%", padding: 12, background: "var(--bg)", color: "var(--text)" }} value={shipping} onChange={(event) => setShipping(event.target.value)}>
            <option>Kerry Express</option>
            <option>ไปรษณีย์ไทย EMS</option>
          </select>
        </section>

        <section style={panel}>
          <h2>4. ตรวจสอบและยืนยัน</h2>
          <p style={{ fontSize: 20 }}>
            ยอดประมาณการ <strong style={{ color: "var(--accent)" }}>{formatPriceTHB(isDirect ? (directVariant?.price ?? 0) * quantity : cart?.total_price ?? 0)}</strong>
          </p>
          <p style={{ color: "var(--text-dim)" }}>ระบบจะยืนยันราคาและจำนวนคงเหลือจากฐานข้อมูลอีกครั้ง และแสดงยอดจริงในคำสั่งซื้อ</p>
          {createOrder.isError ? <p style={{ color: "#e85d5d" }}>{createOrder.error.message}</p> : null}
          <button style={button} disabled={createOrder.isPending || (addressMode === "saved" && !selectedAddressId) || (isDirect ? !directIsValid : !hasValidCart)}>
            {createOrder.isPending ? "กำลังสร้างคำสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ"}
          </button>
        </section>
      </form>
    </AccountShell>
  );
}
