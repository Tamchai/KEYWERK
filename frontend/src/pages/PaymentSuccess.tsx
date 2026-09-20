import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AccountShell from "../components/account/AccountShell";
import { panel } from "../components/account/accountStyles";
import { useOrderQuery } from "../hooks/queries/useCommerceQueries";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id") ?? "";
  const { orderQuery, reconcilePayment } = useOrderQuery(orderId, true);
  const checkedSession = useRef<string | null>(null);
  const reconcile = reconcilePayment.mutate;
  useEffect(() => {
    const sessionID = orderQuery.data?.payment?.provider_session_id;
    if (orderQuery.data?.payment?.status === "pending" && sessionID && checkedSession.current !== sessionID) {
      checkedSession.current = sessionID;
      reconcile();
    }
  }, [orderQuery.data?.payment?.status, orderQuery.data?.payment?.provider_session_id, reconcile]);
  const paid = orderQuery.data?.payment?.status === "paid";
  const failed = orderQuery.data?.payment?.status === "failed";

  return (
    <AccountShell title="ผลการชำระเงิน">
      <section style={{ ...panel, textAlign: "center", padding: 40 }}>
        <p className="kw-status-badge" data-status={paid ? "paid" : failed ? "failed" : "pending"}>
          {paid ? "ชำระเงินสำเร็จ" : failed ? "ชำระเงินไม่สำเร็จ" : "Stripe รับรายการแล้ว"}
        </p>
        <h2 style={{ margin: "14px 0" }}>{paid ? "คำสั่งซื้อกำลังเข้าสู่ขั้นตอนจัดเตรียม" : failed ? "กลับไปที่คำสั่งซื้อเพื่อลองใหม่" : "กำลังยืนยันสถานะการชำระเงิน..."}</h2>
        <p style={{ color: "var(--text-dim)", marginBottom: 24 }}>
          {paid ? "ระบบได้รับการยืนยันจาก Stripe เรียบร้อยแล้ว" : failed ? "ไม่มีการตัดเงินจริง คุณสามารถเริ่ม Stripe Checkout รอบใหม่ได้" : "หน้านี้จะตรวจสถานะอัตโนมัติ คุณสามารถเปิดหน้าคำสั่งซื้อเพื่อตรวจสอบภายหลังได้"}
        </p>
        {orderId ? <Link to={`/orders/${orderId}`}>ดูรายละเอียดคำสั่งซื้อ</Link> : <Link to="/orders">ดูคำสั่งซื้อทั้งหมด</Link>}
        {orderQuery.isError ? <p style={{ color: "var(--danger)", marginTop: 16 }}>{orderQuery.error.message}</p> : null}
      </section>
    </AccountShell>
  );
}
