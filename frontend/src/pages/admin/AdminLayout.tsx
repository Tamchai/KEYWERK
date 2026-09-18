import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft, Boxes, CreditCard, LayoutDashboard, LogOut, Package, ShoppingBag, Tags } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

const links = [
  { to: "/admin", label: "ภาพรวม", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "สินค้า", icon: Package },
  { to: "/admin/product-variants", label: "ตัวเลือกสินค้า", icon: Boxes },
  { to: "/admin/brands", label: "แบรนด์", icon: Tags },
  { to: "/admin/categories", label: "หมวดหมู่", icon: Tags },
  { to: "/admin/orders", label: "คำสั่งซื้อ", icon: ShoppingBag },
  { to: "/admin/payments", label: "การชำระเงิน", icon: CreditCard },
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <button type="button" onClick={() => navigate("/")} className="admin-brand">
          <span className="admin-brand-mark">K</span>
          <span><strong>KEYWERK</strong><small>CONTROL CENTER</small></span>
        </button>
        <nav className="admin-nav">
          {links.map((link) => (
            <NavLink className="admin-nav-link" key={link.to} to={link.to} end={link.end} style={({ isActive }) => ({
              color: isActive ? "var(--text)" : "var(--text-dim)",
              background: isActive ? "linear-gradient(90deg, rgba(242,194,48,.16), rgba(242,194,48,.05))" : "transparent",
              borderColor: isActive ? "rgba(242,194,48,.24)" : "transparent",
            })}>
              <link.icon size={18} strokeWidth={1.8} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button type="button" onClick={() => navigate("/profile")} className="admin-back"><ArrowLeft size={17} /> กลับไปหน้าบัญชี</button>
          <button type="button" onClick={handleLogout} className="admin-logout"><LogOut size={17} /> ออกจากระบบ</button>
        </div>
      </aside>
      <main className="admin-content"><Outlet /></main>
    </div>
  );
};

export default AdminLayout;
