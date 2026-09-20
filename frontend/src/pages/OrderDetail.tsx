import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { AddressPayload, Order, OrderStatus, PaymentStatus } from "../api/types";
import AccountShell from "../components/account/AccountShell";
import { button, input, panel } from "../components/account/accountStyles";
import { useOrderQuery } from "../hooks/queries/useCommerceQueries";
import { useAuthStore } from "../stores/authStore";
import { ApiError } from "../api/client";
import { useConfirmDialog } from "../components/ui/dialog-context";
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
  const { orderQuery, submitPayment, reconcilePayment, updateAddress, cancelOrder } = useOrderQuery(orderId, true);
  const confirmDialog = useConfirmDialog();
  const [addressForm, setAddressForm] = useState<AddressPayload | null>(null);
  const order = orderQuery.data;
  const checkedSession = useRef<string | null>(null);
  const reconcile = reconcilePayment.mutate;

  useEffect(() => {
    const sessionID = order?.payment?.provider_session_id;
    if (order?.payment?.status === "pending" && sessionID && checkedSession.current !== sessionID) {
      checkedSession.current = sessionID;
      reconcile();
    }
  }, [order?.payment?.status, order?.payment?.provider_session_id, reconcile]);

  if (orderQuery.isLoading) return <AccountShell title="รายละเอียดคำสั่งซื้อ"><p>กำลังโหลด...</p></AccountShell>;
  if (orderQuery.isError || !order) return <AccountShell title="รายละเอียดคำสั่งซื้อ"><p style={{ color: "var(--danger)" }}>{orderQuery.error?.message ?? "ไม่พบคำสั่งซื้อ"}</p></AccountShell>;

  const mutationError = submitPayment.error ?? updateAddress.error ?? cancelOrder.error;
  const reconcileError = reconcilePayment.error;
  const reconcileErrorMessage = reconcileError instanceof ApiError && reconcileError.status === 404
    ? "ระบบตรวจสอบสถานะยังไม่พร้อม (404) กรุณารีสตาร์ต backend แล้วลองอีกครั้ง"
    : reconcileError instanceof ApiError && reconcileError.status === 503
      ? "เชื่อมต่อ Stripe ไม่สำเร็จ กรุณาลองอีกครั้ง"
      : "ตรวจสอบกับ Stripe ไม่สำเร็จ กรุณาลองอีกครั้ง";
  const canSubmitPayment = !isAdmin && order.status === "pending" && (!order.payment || order.payment.status === "failed");
  const canCancel = !isAdmin && order.status === "pending" && (!order.payment || order.payment.status === "failed");
  const handleCancel = async () => {
    const confirmed = await confirmDialog({
      title: "ยกเลิกคำสั่งซื้อนี้?",
      description: "เมื่อยกเลิกแล้ว ระบบจะคืนจำนวนสินค้าเข้าสต็อก และไม่สามารถย้อนกลับได้",
      confirmLabel: "ยืนยันการยกเลิก",
      cancelLabel: "เก็บคำสั่งซื้อไว้",
      destructive: true,
    });
    if (confirmed) cancelOrder.mutate();
  };
  const setAddressField = (key: keyof AddressPayload, value: string) => {
    setAddressForm((current) => current ? { ...current, [key]: value } : current);
  };

  return (
    <AccountShell title={`คำสั่งซื้อ #${order.order_id.slice(0, 8)}`}>
      <div style={{ ...panel, marginBottom: 16 }}>
        <div className="mb-3 flex items-center gap-3"><strong>สถานะคำสั่งซื้อ</strong><span className="kw-status-badge" data-status={order.status}>{statusLabels[order.status]}</span></div>
        <p>สร้างเมื่อ {formatDate(order.created_at)} · อัปเดตล่าสุด {formatDate(order.updated_at)}</p>
        <p>จัดส่งถึง {order.receiver_name} · {order.phone_number}<br />{order.address_line1} {order.address_line2} {order.district} {order.province} {order.postal_code}</p>
        {order.tracking_number ? <p>เลขติดตาม: {order.tracking_number}</p> : null}
        {!isAdmin && order.status === "pending" && !addressForm ? <button type="button" onClick={() => setAddressForm(addressFrom(order))}>แก้ไขที่อยู่จัดส่ง</button> : null}
        {canCancel ? <div className="kw-order-cancel"><p>ยังไม่ชำระเงิน? คุณสามารถยกเลิกคำสั่งซื้อนี้ได้</p><button type="button" disabled={cancelOrder.isPending} onClick={handleCancel}>{cancelOrder.isPending ? "กำลังยกเลิก..." : "ยกเลิกคำสั่งซื้อ"}</button></div> : null}
        {!isAdmin && order.status === "pending" && order.payment?.status === "pending" ? <p className="kw-order-cancel-note">ระหว่างรอผลจาก Stripe ยังยกเลิกคำสั่งซื้อไม่ได้ โปรดรอให้การชำระเงินสิ้นสุดก่อน</p> : null}
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
        {order.payment ? <div className="my-3 flex items-center gap-3"><span>สถานะ</span><span className="kw-status-badge" data-status={order.payment.status}>{paymentLabels[order.payment.status]}</span></div> : isAdmin ? <p>ลูกค้ายังไม่ส่งข้อมูลการชำระเงิน</p> : order.status === "cancelled" ? <p>คำสั่งซื้อนี้ถูกยกเลิก</p> : null}
        {order.payment?.status === "pending" ? <p>กำลังรอผลจาก Stripe หากชำระแล้ว ระบบจะตรวจสอบสถานะอีกครั้งให้อัตโนมัติ</p> : null}
        {!isAdmin && order.payment?.status === "pending" ? <div className="kw-payment-actions"><button className="kw-payment-recheck" type="button" disabled={reconcilePayment.isPending} onClick={() => reconcilePayment.mutate()}>{reconcilePayment.isPending ? "กำลังตรวจสอบ..." : "ตรวจสอบการชำระเงินอีกครั้ง"}</button>{order.payment.checkout_url ? <button className="kw-payment-return" type="button" onClick={() => window.location.assign(order.payment!.checkout_url!)}>กลับไปหน้า Stripe Checkout</button> : null}</div> : null}
        {order.payment?.status === "failed" && !isAdmin ? <p style={{ color: "var(--danger)" }}>เซสชันชำระเงินเดิมไม่สำเร็จ กรุณาลองเปิด Stripe Checkout ใหม่</p> : null}
        {canSubmitPayment ? (
          <button style={button} disabled={submitPayment.isPending} onClick={() => submitPayment.mutate(undefined, {
            onSuccess: (payment) => {
              if (payment.checkout_url) window.location.assign(payment.checkout_url);
            },
          })}>
            {submitPayment.isPending ? "กำลังเปิด Stripe..." : order.payment?.status === "failed" ? "ลองชำระผ่าน Stripe อีกครั้ง" : "ชำระเงินผ่าน Stripe"}
          </button>
        ) : null}
        {reconcilePayment.isError ? <p role="alert" className="kw-payment-error">{reconcileErrorMessage}</p> : null}
        {mutationError ? <p role="alert" style={{ color: "var(--danger)" }}>{mutationError.message}</p> : null}
      </div>
    </AccountShell>
  );
}
