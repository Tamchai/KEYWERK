interface CategoryCardProps {
  image: string;
  label: string;
  description: string;
  href: string;
}

export const CategoryCard = ({ image, label, description, href }: CategoryCardProps) => (
  <a
    href={href}
    style={{
      flex: "0 0 auto",
      width: 260,
      background: "var(--surface)",
      border: "1px solid var(--line)",
      borderRadius: 12,
      padding: "28px 22px",
      textDecoration: "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 20,
      scrollSnapAlign: "start",
      transition: "border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
    }}
    onMouseEnter={(e) => {
      const el = e.currentTarget as HTMLElement;
      el.style.borderColor = "var(--accent)";
      el.style.transform = "translateY(-2px)";
      el.style.boxShadow = "0 8px 20px rgba(0,0,0,.35)";
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget as HTMLElement;
      el.style.borderColor = "var(--line)";
      el.style.transform = "translateY(0)";
      el.style.boxShadow = "none";
    }}
  >
    <img
      src={image}
      alt={label}
      style={{
        width: 180,
        height: 180,
        objectFit: "contain",
      }}
    />

    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: 18,
            color: "var(--text)",
          }}
        >
          {label}
        </span>
        <span style={{ color: "var(--text-dim)", fontSize: 16 }}>→</span>
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: "var(--text-dim)",
        }}
      >
        {description}
      </p>
    </div>
  </a>
);

export default CategoryCard;