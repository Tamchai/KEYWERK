import { NavLink, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const LINKS = [
  { to: "/admin/products", label: "Products", emoji: "⌨️" },
  { to: "/admin/product-variants", label: "Product Variants", emoji: "🔧" },
  { to: "/admin/brands", label: "Brands", emoji: "🏷️" },
  { to: "/admin/categories", label: "Categories", emoji: "🗂️" },
];

export const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <aside
        style={{
          width: 232,
          flexShrink: 0,
          background: "var(--bg-alt)",
          borderRight: "1px solid var(--line)",
          padding: "24px 16px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              color: "var(--text)",
              cursor: "pointer",
              padding: 0,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: "-0.02em",
            }}
          >
            🛠️ KEYWERK Admin
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                textDecoration: "none",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13.5,
                color: isActive ? "var(--accent)" : "var(--text-dim)",
                background: isActive ? "var(--surface)" : "transparent",
                border: `1px solid ${isActive ? "var(--line)" : "transparent"}`,
              })}
            >
              <span style={{ fontSize: 14 }}>{link.emoji}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => navigate("/profile")}
          style={{
            display: "block",
            width: "100%",
            marginTop: 28,
            padding: "10px 12px",
            background: "transparent",
            color: "var(--text-dim)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          ← กลับไปหน้าเว็บ
        </button>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "28px 32px", boxSizing: "border-box" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
