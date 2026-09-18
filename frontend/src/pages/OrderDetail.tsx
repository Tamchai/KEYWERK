import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { AddressPayload, Order, OrderStatus, PaymentStatus } from "../api/types";
import AccountShell from "../components/account/AccountShell";
import { button, input, panel } from "../components/account/accountStyles";
import { useOrderQuery } from "../hooks/queries/useCommerceQueries";
import { useAuthStore } from "../stores/authStore";
import { formatPriceTHB } from "../utils/format";

const statusLabels: Record<OrderStatus, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังจัดเตรียม",
  shipped: "จัดส่งแล้ว",
  cancelled: "ยกเลิก",
};

const paymentLabels: Record<PaymentStatus, string> = {
  pending: "รอชำระผ่าน Stripe",
  paid: "ชำระแล้ว",
  failed: "ไม่ผ่านการตรวจสอบ",
};

const addressFields: Array<[keyof AddressPayload, string]> = [
  ["receiver_name", "ชื่อผู้รับ"],
  ["phone_number", "เบอร์โทร"],
  ["address_line1", "ที่อยู่"],
  ["address_line2", "รายละเอียดเพิ่มเติม"],
  ["district", "เขต/อำเภอ"],
  ["province", "จังหวัด"],
  ["postal_code", "รหัสไปรษณีย์"],
];

function addressFrom(order: Order): AddressPayload {
  return {
    title: "ที่อยู่คำสั่งซื้อ",
    receiver_name: order.receiver_name,
    phone_number: order.phone_number,
    address_line1: order.address_line1,
    address_line2: order.address_line2,
    district: order.district,
    province: order.province,
    postal_code: order.postal_code,
    is_default: false,
  };
}

const formatDate = (value: string) => new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(value));

export default function OrderDetail() {
  const { orderId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const { orderQuery, submitPayment, updateAddress } = useOrderQuery(orderId);
  const [addressForm, setAddressForm] = useState<AddressPayload | null>(null);
  const order = orderQuery.data;

  if (orderQuery.isLoading) return <AccountShell title="รายละเอียดคำสั่งซื้อ"><p>กำลังโหลด...</p></AccountShell>;
  if (orderQuery.isError || !order) return <AccountShell title="รายละเอียดคำสั่งซื้อ"><p style={{ color: "#e85d5d" }}>{orderQuery.error?.message ?? "ไม่พบคำสั่งซื้อ"}</p></AccountShell>;

  const mutationError = submitPayment.error ?? updateAddress.error;
  const canSubmitPayment = !isAdmin && order.status !== "cancelled" && (!order.payment || order.payment.status === "failed");
  const setAddressField = (key: keyof AddressPayload, value: string) => {
    setAddressForm((current) => current ? { ...current, [key]: value } : current);
  };

  return (
    <AccountShell title={`คำสั่งซื้อ #${order.order_id.slice(0, 8)}`}>
      <div style={{ ...panel, marginBottom: 16 }}>
        <strong>สถานะ: {statusLabels[order.status]}</strong>
        <p>สร้างเมื่อ {formatDate(order.created_at)} · อัปเดตล่าสุด {formatDate(order.updated_at)}</p>
        <p>จัดส่งถึง {order.receiver_name} · {order.phone_number}<br />{order.address_line1} {order.address_line2} {order.district} {order.province} {order.postal_code}</p>
        {order.tracking_number ? <p>เลขติดตาม: {order.tracking_number}</p> : null}
        {!isAdmin && order.status === "pending" && !addressForm ? <button type="button" onClick={() => setAddressForm(addressFrom(order))}>แก้ไขที่อยู่จัดส่ง</button> : null}
        {addressForm ? (
          <form onSubmit={(event) => {
            event.preventDefault();
            updateAddress.mutate(addressForm, { onSuccess: () => setAddressForm(null) });
          }} style={{ marginTop: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
              {addressFields.map(([key, label]) => <input key={key} required={key !== "address_line2"} style={input} placeholder={label} value={String(addressForm[key])} onChange={(event) => setAddressField(key, event.target.value)} />)}
            </div>
            <button type="submit" style={button} disabled={updateAddress.isPending}>บันทึกที่อยู่</button>
            <button type="button" style={{ marginLeft: 10 }} onClick={() => setAddressForm(null)}>ยกเลิก</button>
          </form>
        ) : null}
      </div>

      <div style={{ ...panel, marginBottom: 16 }}>
        {order.items.map((item) => (
          <div key={item.orderitem_id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span>{item.product_name} · {item.variant_name} × {item.quantity}</span>
            <span>{formatPriceTHB(item.subtotal)}</span>
          </div>
        ))}
        <hr style={{ borderColor: "var(--line)" }} />
        <strong>รวม {formatPriceTHB(order.total_price)}</strong>
      </div>

      <div style={panel}>
        <h2>การชำระเงิน</h2>
        {searchParams.get("payment") === "cancelled" ? <p style={{ color: "var(--accent)", marginTop: 12 }}>คุณยกเลิกหน้า Stripe แล้ว สามารถกลับไปชำระใหม่ได้เมื่อพร้อม</p> : null}
        {order.payment ? <p>สถานะ: {paymentLabels[order.payment.status]}</p> : isAdmin ? <p>ลูกค้ายังไม่ส่งข้อมูลการชำระเงิน</p> : order.status === "cancelled" ? <p>คำสั่งซื้อนี้ถูกยกเลิก</p> : null}
        {order.payment?.status === "pending" ? <p>เปิดหน้า Stripe Checkout เพื่อชำระเงินอย่างปลอดภัย สถานะจะอัปเดตอัตโนมัติจาก Stripe</p> : null}
        {order.payment?.status === "failed" && !isAdmin ? <p style={{ color: "#e85d5d" }}>เซสชันชำระเงินเดิมไม่สำเร็จ กรุณาลองเปิด Stripe Checkout ใหม่</p> : null}
        {canSubmitPayment ? (
          <button style={button} disabled={submitPayment.isPending} onClick={() => submitPayment.mutate(undefined, {
            onSuccess: (payment) => {
              if (payment.checkout_url) window.location.assign(payment.checkout_url);
            },
          })}>
            {submitPayment.isPending ? "กำลังเปิด Stripe..." : order.payment?.status === "failed" ? "ลองชำระผ่าน Stripe อีกครั้ง" : "ชำระเงินผ่าน Stripe"}
          </button>
        ) : null}
        {!isAdmin && order.payment?.status === "pending" && order.payment.checkout_url ? (
          <button style={button} onClick={() => window.location.assign(order.payment!.checkout_url!)}>กลับไปหน้า Stripe Checkout</button>
        ) : null}
        {mutationError ? <p style={{ color: "#e85d5d" }}>{mutationError.message}</p> : null}
      </div>
    </AccountShell>
  );
}
