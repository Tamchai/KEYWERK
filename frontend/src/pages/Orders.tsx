import { useState } from "react";
import { ArrowRight, CalendarDays, CircleAlert, Clock3, Package, PackageCheck, ShoppingBag, Truck, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { OrderStatus } from "../api/types";
import AccountShell from "../components/account/AccountShell";
import { useOrdersQuery } from "../hooks/queries/useCommerceQueries";
import { cn } from "../lib/utils";
import { formatPriceTHB } from "../utils/format";

const statusMeta = {
  pending: { label: "รอดำเนินการ", detail: "รอการชำระเงินหรือยืนยันคำสั่งซื้อ", icon: Clock3, className: "border-amber-300/20 bg-amber-300/10 text-amber-200" },
  processing: { label: "กำลังจัดเตรียม", detail: "ร้านค้ากำลังจัดเตรียมสินค้าของคุณ", icon: Package, className: "border-sky-300/20 bg-sky-300/10 text-sky-200" },
  shipped: { label: "จัดส่งแล้ว", detail: "สินค้าออกเดินทางไปหาคุณแล้ว", icon: Truck, className: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200" },
  cancelled: { label: "ยกเลิก", detail: "คำสั่งซื้อนี้ถูกยกเลิก", icon: XCircle, className: "border-red-300/20 bg-red-300/10 text-red-200" },
} satisfies Record<OrderStatus, { label: string; detail: string; icon: typeof Clock3; className: string }>;

const filters: Array<{ value: "all" | OrderStatus; label: string }> = [
  { value: "all", label: "ทั้งหมด" }, { value: "pending", label: "รอดำเนินการ" },
  { value: "processing", label: "กำลังจัดเตรียม" }, { value: "shipped", label: "จัดส่งแล้ว" },
  { value: "cancelled", label: "ยกเลิก" },
];

const formatDate = (value: string) => new Intl.DateTimeFormat("th-TH", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
}).format(new Date(value));

export default function Orders() {
  const ordersQuery = useOrdersQuery();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const allOrders = ordersQuery.data ?? [];
  const orders = allOrders.filter((order) => filter === "all" || order.status === filter);
  const activeCount = allOrders.filter((order) => order.status === "pending" || order.status === "processing").length;

  return (
    <AccountShell title="คำสั่งซื้อของฉัน">
      <section className="mb-6 grid grid-cols-3 gap-4">
        <Summary icon={ShoppingBag} label="คำสั่งซื้อทั้งหมด" value={allOrders.length} tone="accent" />
        <Summary icon={Package} label="กำลังดำเนินการ" value={activeCount} tone="blue" />
        <Summary icon={PackageCheck} label="จัดส่งแล้ว" value={allOrders.filter((order) => order.status === "shipped").length} tone="green" />
      </section>

      <div className="mb-5 flex items-center justify-between rounded-2xl border border-[var(--line)] bg-black/15 p-2">
        <div className="flex items-center gap-1" role="group" aria-label="กรองสถานะคำสั่งซื้อ">
          {filters.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={cn("border-0 px-4 py-2 text-sm font-semibold text-[var(--text-dim)] transition-colors", filter === item.value && "bg-[var(--accent)] text-[#18140a] shadow-lg shadow-black/20")}>{item.label}{item.value !== "all" ? <span className="ml-2 opacity-65">{allOrders.filter((order) => order.status === item.value).length}</span> : null}</button>)}
        </div>
        <span className="pr-3 text-xs text-[var(--text-dim)]">แสดง {orders.length} รายการ</span>
      </div>

      {ordersQuery.isLoading ? <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-10 text-center text-[var(--text-dim)]"><Clock3 className="mx-auto mb-3 animate-pulse text-[var(--accent)]" />กำลังโหลดคำสั่งซื้อ...</div> : null}
      {ordersQuery.isError ? <div className="flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-red-300"><CircleAlert size={20} />{ordersQuery.error.message}</div> : null}
      {!ordersQuery.isLoading && !ordersQuery.isError && !orders.length ? <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-8 py-16 text-center"><ShoppingBag className="mx-auto mb-4 text-[var(--accent)]" size={34} /><h2 className="text-xl">ยังไม่มีคำสั่งซื้อในสถานะนี้</h2><p className="mt-2 text-sm text-[var(--text-dim)]">เมื่อมีรายการ คำสั่งซื้อของคุณจะแสดงอยู่ที่นี่</p><Link className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[#18140a] no-underline" to="/products">เลือกดูสินค้า</Link></div> : null}

      <div className="grid gap-3">
        {orders.map((order) => {
          const meta = statusMeta[order.status];
          const StatusIcon = meta.icon;
          return <Link key={order.order_id} to={`/orders/${order.order_id}`} className="group grid grid-cols-[minmax(0,1fr)_220px_180px_36px] items-center gap-6 rounded-2xl border border-[var(--line)] bg-gradient-to-r from-[var(--surface)] to-[var(--surface-top)] p-5 no-underline shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-[var(--line-bright)] hover:shadow-xl hover:shadow-black/20">
            <div className="min-w-0"><div className="mb-2 flex items-center gap-2"><span className="text-xs font-bold tracking-[.12em] text-[var(--accent)]">ORDER</span><strong className="font-mono text-base">#{order.order_id.slice(0, 8).toUpperCase()}</strong></div><p className="flex items-center gap-2 truncate text-sm text-[var(--text-dim)]"><CalendarDays size={15} /> {formatDate(order.created_at)} · {order.receiver_name}</p></div>
            <div><span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold", meta.className)}><StatusIcon size={14} />{meta.label}</span><p className="mt-2 text-xs text-[var(--text-dim)]">{meta.detail}</p></div>
            <div className="text-right"><p className="text-xs text-[var(--text-dim)]">ยอดรวม</p><strong className="mt-1 block text-xl text-[var(--accent)]">{formatPriceTHB(order.total_price)}</strong></div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-[var(--text-dim)] transition group-hover:bg-[var(--accent)] group-hover:text-[#18140a]"><ArrowRight size={18} /></span>
          </Link>;
        })}
      </div>
    </AccountShell>
  );
}

function Summary({ icon: Icon, label, value, tone }: { icon: typeof ShoppingBag; label: string; value: number; tone: "accent" | "blue" | "green" }) {
  const tones = { accent: "bg-[var(--accent-soft)] text-[var(--accent)]", blue: "bg-sky-300/10 text-sky-200", green: "bg-emerald-300/10 text-emerald-200" };
  return <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-lg shadow-black/10"><div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-xl", tones[tone])}><Icon size={20} /></div><p className="text-xs font-semibold tracking-widest text-[var(--text-dim)]">{label}</p><strong className="mt-1 block text-3xl">{value}</strong></div>;
}
