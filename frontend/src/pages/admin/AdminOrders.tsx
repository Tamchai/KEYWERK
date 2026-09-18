import { useState } from "react";
import { Link } from "react-router-dom";
import type { OrderStatus } from "../../api/types";
import { AdminPageShell } from "../../components/admin/adminStyles";
import { primaryBtn, tableStyle, tdStyle, thStyle } from "../../components/admin/adminStyleTokens";
import { useAdminOrdersQuery } from "../../hooks/queries/useCommerceQueries";
import { formatPriceTHB } from "../../utils/format";
import { useConfirmDialog, usePromptDialog } from "../../components/ui/dialog-context";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { usePagination } from "../../hooks/usePagination";
import { useAdminTablePageSize } from "../../hooks/useAdminTablePageSize";

const statusLabels: Record<OrderStatus, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังจัดเตรียม",
  shipped: "จัดส่งแล้ว",
  cancelled: "ยกเลิก",
};

const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: [],
  cancelled: [],
};

export default function AdminOrders() {
  const { ordersQuery, changeStatus, saveTracking } = useAdminOrdersQuery();
  const confirmDialog = useConfirmDialog();
  const promptDialog = usePromptDialog();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const orders = ordersQuery.data?.filter((order) => filter === "all" || order.status === filter) ?? [];
  const { panelRef, pageSize } = useAdminTablePageSize(orders.length);
  const orderPages = usePagination(orders, pageSize, filter);
  const error = ordersQuery.error ?? changeStatus.error ?? saveTracking.error;

  const handleStatus = async (orderId: string, status: OrderStatus) => {
    const confirmed = await confirmDialog({
      title: "เปลี่ยนสถานะคำสั่งซื้อ",
      description: `ยืนยันการเปลี่ยนสถานะเป็น “${statusLabels[status]}”`,
      confirmLabel: "เปลี่ยนสถานะ",
      destructive: status === "cancelled",
    });
    if (!confirmed) return;
    changeStatus.mutate({ id: orderId, status });
  };

  const handleTracking = async (orderId: string, current: string) => {
    const trackingNumber = await promptDialog({
      title: "บันทึกเลขติดตามพัสดุ",
      description: "ระบบจะบันทึกเลขติดตามและเปลี่ยนสถานะคำสั่งซื้อเป็นจัดส่งแล้ว",
      confirmLabel: "บันทึกและจัดส่ง",
      input: { label: "เลขติดตามพัสดุ", defaultValue: current, placeholder: "เช่น TH123456789", required: true },
    });
    if (!trackingNumber) return;
    saveTracking.mutate({ id: orderId, trackingNumber });
  };

  return (
    <AdminPageShell>
      <h1>คำสั่งซื้อ</h1>
      <label>
        กรองสถานะ{" "}
        <select value={filter} onChange={(event) => setFilter(event.target.value as "all" | OrderStatus)}>
          <option value="all">ทั้งหมด</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {error ? <p style={{ color: "#e85d5d" }}>{error.message}</p> : null}
      {ordersQuery.isLoading ? <p>กำลังโหลด...</p> : (
        <div ref={panelRef} className="admin-table-panel" style={{ marginTop: 20 }}>
          <table style={tableStyle}>
            <thead><tr><th style={thStyle}>เลขออเดอร์</th><th style={thStyle}>ผู้รับ</th><th style={thStyle}>ยอดรวม</th><th style={thStyle}>สถานะ</th><th style={thStyle}>จัดการ</th></tr></thead>
            <tbody>
              {orderPages.items.map((order) => (
                <tr key={order.order_id}>
                  <td style={tdStyle}><Link to={`/orders/${order.order_id}`}>#{order.order_id.slice(0, 8)}</Link></td>
                  <td style={tdStyle}>{order.receiver_name}</td>
                  <td style={tdStyle}>{formatPriceTHB(order.total_price)}</td>
                  <td style={tdStyle}>{statusLabels[order.status]}</td>
                  <td style={tdStyle}>
                    {nextStatuses[order.status].map((status) => (
                      <button key={status} style={{ ...primaryBtn, marginRight: 8, marginBottom: 6 }} disabled={changeStatus.isPending} onClick={() => void handleStatus(order.order_id, status)}>
                        {statusLabels[status]}
                      </button>
                    ))}
                    {order.status === "processing" || order.status === "shipped" ? (
                      <button style={primaryBtn} disabled={saveTracking.isPending} onClick={() => void handleTracking(order.order_id, order.tracking_number)}>
                        {order.tracking_number ? "แก้เลขติดตาม" : "เพิ่มเลขติดตาม"}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length ? <p>ไม่พบคำสั่งซื้อในสถานะนี้</p> : null}
          <AdminPagination {...orderPages} onPageChange={orderPages.setPage} />
        </div>
      )}
    </AdminPageShell>
  );
}
