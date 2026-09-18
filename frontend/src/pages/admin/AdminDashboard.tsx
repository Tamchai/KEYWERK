import { Link } from "react-router-dom";
import { AdminPageShell } from "../../components/admin/adminStyles";
import { useAdminOrdersQuery, useAdminPaymentsQuery } from "../../hooks/queries/useCommerceQueries";
import { useAdminProductsQuery } from "../../hooks/queries/useCatalogQueries";

export default function AdminDashboard() {
  const { productsQuery } = useAdminProductsQuery();
  const { ordersQuery } = useAdminOrdersQuery();
  const { paymentsQuery } = useAdminPaymentsQuery();
  const loading = productsQuery.isLoading || ordersQuery.isLoading || paymentsQuery.isLoading;
  const error = productsQuery.error ?? ordersQuery.error ?? paymentsQuery.error;
  const cards = [
    { label: "สินค้าทั้งหมด", value: productsQuery.data?.length ?? 0, href: "/admin/products" },
    { label: "ออเดอร์รอดำเนินการ", value: ordersQuery.data?.filter((order) => order.status === "pending").length ?? 0, href: "/admin/orders" },
    { label: "การชำระเงินรอตรวจ", value: paymentsQuery.data?.filter((payment) => payment.status === "pending").length ?? 0, href: "/admin/payments" },
  ];

  return (
    <AdminPageShell>
      <h1>ภาพรวมระบบ</h1>
      {loading ? <p style={{ marginTop: 16 }}>กำลังโหลด...</p> : null}
      {error ? <p style={{ marginTop: 16, color: "#e85d5d" }}>{error.message}</p> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 16, marginTop: 24 }}>
        {cards.map((card) => (
          <Link key={card.label} to={card.href} style={{ padding: 20, border: "1px solid var(--line)", borderRadius: 12, background: "var(--surface)", textDecoration: "none" }}>
            <span style={{ color: "var(--text-dim)" }}>{card.label}</span>
            <strong style={{ display: "block", marginTop: 10, color: "var(--accent)", fontSize: 30 }}>{card.value}</strong>
          </Link>
        ))}
      </div>
    </AdminPageShell>
  );
}
