import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, CreditCard, XCircle } from "lucide-react";
import type { PaymentStatus } from "../../api/types";
import { AdminPageShell } from "../../components/admin/adminStyles";
import { useAdminPaymentsQuery } from "../../hooks/queries/useCommerceQueries";
import { formatPriceTHB } from "../../utils/format";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { usePagination } from "../../hooks/usePagination";
import { useAdminTablePageSize } from "../../hooks/useAdminTablePageSize";

const statusMeta = {
  pending: { label: "รอ Stripe ยืนยัน", icon: Clock3 },
  paid: { label: "ชำระแล้ว", icon: CheckCircle2 },
  failed: { label: "ไม่สำเร็จ", icon: XCircle },
} satisfies Record<PaymentStatus, { label: string; icon: typeof Clock3 }>;

export default function AdminPayments() {
  const { paymentsQuery } = useAdminPaymentsQuery();
  const [filter, setFilter] = useState<"all" | PaymentStatus>("all");
  const allPayments = paymentsQuery.data ?? [];
  const payments = allPayments.filter((payment) => filter === "all" || payment.status === filter);
  const { panelRef, pageSize } = useAdminTablePageSize(payments.length);
  const paymentPages = usePagination(payments, pageSize, filter);

  return (
    <AdminPageShell>
      <div className="mb-6 flex items-end justify-between gap-8">
        <div>
          <p className="mb-2 text-sm font-bold text-[var(--accent)]">PAYMENT OVERVIEW</p>
          <h1 className="!mb-2">การชำระเงิน</h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--text-dim)]">Stripe ยืนยันการชำระเงินผ่าน webhook อัตโนมัติ ไม่ต้องกดอนุมัติทีละรายการ</p>
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--accent)]"><CreditCard size={23} /></div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {(["pending", "paid", "failed"] as const).map((status) => {
          const meta = statusMeta[status];
          const Icon = meta.icon;
          return <div key={status} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-[var(--text-dim)]"><Icon size={17} />{meta.label}</div>
            <strong className="text-2xl tabular-nums">{allPayments.filter((payment) => payment.status === status).length.toLocaleString("th-TH")}</strong>
          </div>;
        })}
      </div>

      <div className="mb-4 flex items-center justify-between gap-5">
        <div className="flex gap-2" role="group" aria-label="กรองสถานะการชำระเงิน">
          {(["all", "pending", "paid", "failed"] as const).map((status) => <button key={status} type="button" onClick={() => setFilter(status)} aria-pressed={filter === status} className="admin-filter-button">{status === "all" ? "ทั้งหมด" : statusMeta[status].label}</button>)}
        </div>
        <span className="text-sm text-[var(--text-dim)]">{payments.length.toLocaleString("th-TH")} รายการ</span>
      </div>

      {paymentsQuery.isError ? <p role="alert" className="mb-4 text-base text-red-300">{paymentsQuery.error.message}</p> : null}
      {paymentsQuery.isLoading ? <p className="text-base text-[var(--text-dim)]">กำลังโหลดรายการชำระเงิน...</p> : (
        <div ref={panelRef} className="admin-table-panel">
          <table className="w-full text-left text-sm">
            <thead><tr><th>ออเดอร์</th><th>ช่องทาง</th><th>ยอดชำระ</th><th>สถานะ</th><th>การดำเนินการ</th></tr></thead>
            <tbody>
              {paymentPages.items.map((payment) => {
                const meta = statusMeta[payment.status];
                const Icon = meta.icon;
                return <tr key={payment.payment_id}>
                  <td><Link className="font-mono font-semibold text-[var(--text)] hover:text-[var(--accent)]" to={`/orders/${payment.order_id}`}>#{payment.order_id.slice(0, 8).toUpperCase()}</Link></td>
                  <td className="capitalize">{payment.payment_method}</td>
                  <td className="font-semibold tabular-nums">{formatPriceTHB(payment.amount)}</td>
                  <td><span className="kw-status-badge" data-status={payment.status}><Icon size={15} />{meta.label}</span></td>
                  <td className="text-[var(--text-dim)]">{payment.status === "pending" ? "ระบบกำลังรอผลจาก Stripe" : "อัปเดตอัตโนมัติ"}</td>
                </tr>;
              })}
            </tbody>
          </table>
          {!payments.length ? <p className="px-5 py-10 text-center text-base text-[var(--text-dim)]">ไม่พบรายการในสถานะนี้</p> : null}
          <AdminPagination {...paymentPages} onPageChange={paymentPages.setPage} />
        </div>
      )}
    </AdminPageShell>
  );
}
