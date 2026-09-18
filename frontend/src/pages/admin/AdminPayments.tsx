import { useState } from "react";
import { Link } from "react-router-dom";
import type { PaymentStatus } from "../../api/types";
import { AdminPageShell } from "../../components/admin/adminStyles";
import { dangerBtn, primaryBtn, tableStyle, tdStyle, thStyle } from "../../components/admin/adminStyleTokens";
import { useAdminPaymentsQuery } from "../../hooks/queries/useCommerceQueries";
import { formatPriceTHB } from "../../utils/format";
import { useConfirmDialog } from "../../components/ui/dialog-context";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { usePagination } from "../../hooks/usePagination";
import { useAdminTablePageSize } from "../../hooks/useAdminTablePageSize";

const paymentLabels: Record<PaymentStatus, string> = {
  pending: "รอ Stripe ยืนยัน",
  paid: "ชำระแล้ว",
  failed: "ไม่ผ่าน",
};

export default function AdminPayments() {
  const { paymentsQuery, verifyPayment } = useAdminPaymentsQuery();
  const confirmDialog = useConfirmDialog();
  const [filter, setFilter] = useState<"all" | PaymentStatus>("pending");
  const payments = paymentsQuery.data?.filter((payment) => filter === "all" || payment.status === filter) ?? [];
  const { panelRef, pageSize } = useAdminTablePageSize(payments.length);
  const paymentPages = usePagination(payments, pageSize, filter);
  const error = paymentsQuery.error ?? verifyPayment.error;

  const verify = async (paymentId: string, status: "paid" | "failed") => {
    const confirmed = await confirmDialog({
      title: "ยืนยันผลการชำระเงิน",
      description: `เปลี่ยนผลการตรวจสอบเป็น “${paymentLabels[status]}” ใช่หรือไม่?`,
      confirmLabel: "ยืนยันผล",
      destructive: status === "failed",
    });
    if (!confirmed) return;
    verifyPayment.mutate({ id: paymentId, status });
  };

  return (
    <AdminPageShell>
      <h1>การชำระเงินผ่าน Stripe</h1>
      <p style={{ color: "var(--text-dim)", marginBottom: 22 }}>สถานะปกติอัปเดตจาก Stripe webhook อัตโนมัติ ปุ่มด้านล่างใช้แก้ไขสถานะด้วยผู้ดูแลเฉพาะกรณีจำเป็น</p>
      <label>
        กรองสถานะ{" "}
        <select value={filter} onChange={(event) => setFilter(event.target.value as "all" | PaymentStatus)}>
          <option value="all">ทั้งหมด</option>
          {Object.entries(paymentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {error ? <p style={{ color: "#e85d5d" }}>{error.message}</p> : null}
      {paymentsQuery.isLoading ? <p>กำลังโหลด...</p> : (
        <div ref={panelRef} className="admin-table-panel" style={{ marginTop: 20 }}>
          <table style={tableStyle}>
            <thead><tr><th style={thStyle}>ออเดอร์</th><th style={thStyle}>ช่องทาง</th><th style={thStyle}>ยอด</th><th style={thStyle}>สถานะ</th><th style={thStyle}>Manual fallback</th></tr></thead>
            <tbody>
              {paymentPages.items.map((payment) => (
                <tr key={payment.payment_id}>
                  <td style={tdStyle}><Link to={`/orders/${payment.order_id}`}>#{payment.order_id.slice(0, 8)}</Link></td>
                  <td style={tdStyle}>{payment.payment_method}</td>
                  <td style={tdStyle}>{formatPriceTHB(payment.amount)}</td>
                  <td style={tdStyle}>{paymentLabels[payment.status]}</td>
                  <td style={tdStyle}>{payment.status === "pending" ? (
                    <>
                      <button style={primaryBtn} disabled={verifyPayment.isPending} onClick={() => void verify(payment.payment_id, "paid")}>ยืนยัน</button>
                      <button style={{ ...dangerBtn, marginLeft: 8 }} disabled={verifyPayment.isPending} onClick={() => void verify(payment.payment_id, "failed")}>ไม่ผ่าน</button>
                    </>
                  ) : "ตรวจสอบแล้ว"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!payments.length ? <p>ไม่พบรายการชำระเงินในสถานะนี้</p> : null}
          <AdminPagination {...paymentPages} onPageChange={paymentPages.setPage} />
        </div>
      )}
    </AdminPageShell>
  );
}
