import { useState } from "react";
import { ArrowUpRight, CircleAlert, Clock3, Package, PackageCheck, ShoppingBag, Truck, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { OrderStatus } from "../api/types";
import AccountShell from "../components/account/AccountShell";
import { useOrdersQuery } from "../hooks/queries/useCommerceQueries";
import { cn } from "../lib/utils";
import { formatPriceTHB } from "../utils/format";

const statusMeta = {
  pending: { label: "รอชำระเงิน", detail: "รอการชำระเงินผ่าน Stripe", icon: Clock3 },
  processing: { label: "กำลังเตรียมสินค้า", detail: "ร้านค้ากำลังจัดเตรียมสินค้า", icon: Package },
  shipped: { label: "จัดส่งแล้ว", detail: "สินค้าอยู่ระหว่างการจัดส่ง", icon: Truck },
  cancelled: { label: "ยกเลิกแล้ว", detail: "คำสั่งซื้อนี้ถูกยกเลิก", icon: XCircle },
} satisfies Record<OrderStatus, { label: string; detail: string; icon: typeof Clock3 }>;

const filters: Array<{ value: "all" | OrderStatus; label: string }> = [
  { value: "all", label: "ทั้งหมด" }, { value: "pending", label: "รอชำระเงิน" },
  { value: "processing", label: "กำลังเตรียม" }, { value: "shipped", label: "จัดส่งแล้ว" },
  { value: "cancelled", label: "ยกเลิก" },
];

const formatDate = (value: string) => new Intl.DateTimeFormat("th-TH", {
  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
}).format(new Date(value));

export default function Orders() {
  const ordersQuery = useOrdersQuery();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const allOrders = ordersQuery.data ?? [];
  const orders = allOrders.filter((order) => filter === "all" || order.status === filter);
  const activeCount = allOrders.filter((order) => order.status === "pending" || order.status === "processing").length;
  const shippedCount = allOrders.filter((order) => order.status === "shipped").length;

  return <AccountShell title="คำสั่งซื้อของฉัน">
    <div className="mb-7 grid grid-cols-3 gap-4">
      <Summary icon={ShoppingBag} label="คำสั่งซื้อทั้งหมด" value={allOrders.length} note="รายการที่เคยสั่งซื้อ" />
      <Summary icon={Clock3} label="กำลังดำเนินการ" value={activeCount} note="รอชำระเงินหรือเตรียมสินค้า" />
      <Summary icon={PackageCheck} label="จัดส่งแล้ว" value={shippedCount} note="สินค้าออกจากร้านแล้ว" />
    </div>

    <div className="mb-5 flex items-center justify-between gap-6 border-b border-[var(--line)] pb-4">
      <div className="flex items-center gap-2" role="group" aria-label="กรองสถานะคำสั่งซื้อ">
        {filters.map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={cn("!rounded-xl !border-transparent !bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--text-dim)]", filter === item.value && "!border-[var(--line-bright)] !bg-[var(--accent-soft)] !text-[var(--accent)]")}>
          {item.label}<span className="ml-2 opacity-70">{item.value === "all" ? allOrders.length : allOrders.filter((order) => order.status === item.value).length}</span>
        </button>)}
      </div>
      <span className="text-sm text-[var(--text-dim)]">แสดง {orders.length.toLocaleString("th-TH")} รายการ</span>
    </div>

    {ordersQuery.isLoading ? <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-12 text-center text-base text-[var(--text-dim)]"><Clock3 className="mx-auto mb-3 animate-pulse text-[var(--accent)]" />กำลังโหลดคำสั่งซื้อ...</div> : null}
    {ordersQuery.isError ? <div role="alert" className="flex items-center gap-3 rounded-2xl border border-[var(--status-stop-line)] bg-[var(--status-stop-bg)] p-6 text-base text-[var(--status-stop-text)]"><CircleAlert size={20} />{ordersQuery.error.message}</div> : null}
    {!ordersQuery.isLoading && !ordersQuery.isError && !orders.length ? <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-8 py-16 text-center"><ShoppingBag className="mx-auto mb-4 text-[var(--accent)]" size={38} /><h2 className="text-2xl">ยังไม่มีคำสั่งซื้อในสถานะนี้</h2><p className="mt-3 text-base text-[var(--text-dim)]">เมื่อมีรายการ คำสั่งซื้อของคุณจะแสดงอยู่ที่นี่</p><Link className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-[var(--on-accent)] no-underline" to="/products">เลือกดูสินค้า</Link></div> : null}

    <div className="grid gap-4">
      {orders.map((order, index) => {
        const meta = statusMeta[order.status];
        const Icon = meta.icon;
        return <Link key={order.order_id} to={`/orders/${order.order_id}`} className="group relative grid grid-cols-[60px_minmax(0,1fr)_200px_160px_42px] items-center gap-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 no-underline transition hover:border-[var(--line-bright)] hover:bg-[var(--surface-top)]">
          <span className="kw-order-index">{String(index + 1).padStart(2, "0")}</span>
          <div className="min-w-0"><p className="mb-1 text-sm font-semibold text-[var(--text-dim)]">คำสั่งซื้อ <span className="ml-2 font-mono text-[var(--accent)]">#{order.order_id.slice(0, 8).toUpperCase()}</span></p><h2 className="truncate text-lg font-bold text-[var(--text)]">{order.receiver_name || "คำสั่งซื้อของคุณ"}</h2><p className="mt-1 text-sm text-[var(--text-dim)]">{formatDate(order.created_at)}</p></div>
          <div><span className="kw-status-badge" data-status={order.status}><Icon size={16} />{meta.label}</span><p className="mt-2 text-sm text-[var(--text-dim)]">{meta.detail}</p></div>
          <div className="text-right"><p className="text-sm text-[var(--text-dim)]">ยอดรวม</p><strong className="mt-1 block text-xl tabular-nums text-[var(--accent)]">{formatPriceTHB(order.total_price)}</strong></div>
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] text-[var(--text-dim)] transition group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--on-accent)]"><ArrowUpRight size={19} /></span>
        </Link>;
      })}
    </div>
  </AccountShell>;
}

function Summary({ icon: Icon, label, value, note }: { icon: typeof ShoppingBag; label: string; value: number; note: string }) {
  return <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"><div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--accent)] to-transparent" /><div className="mb-4 flex items-center justify-between"><span className="text-base font-semibold text-[var(--text-dim)]">{label}</span><Icon size={20} className="text-[var(--accent)]" /></div><strong className="block text-4xl font-bold tabular-nums text-[var(--text)]">{value.toLocaleString("th-TH")}</strong><p className="mt-2 text-sm text-[var(--text-dim)]">{note}</p></div>;
}
