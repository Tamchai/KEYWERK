interface ProductCardProps {
  image: string;
  category: string;
  brand?: string;
  name: string;
  price: string;
  href: string;
}

export const ProductCard = ({ image, category, brand, name, price, href }: ProductCardProps) => (
  
  <a
    href={href}
    style={{
      display: "flex",
      flexDirection: "column",
      textDecoration: "none",
      borderRadius: 12,
      overflow: "hidden",
      background: "var(--surface)",
      border: "1px solid var(--line)",
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
    {/* พื้นที่ใส่รูป */}
    <div
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        background: "#0a0906",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={image}
        alt={name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>

    <div style={{ padding: "16px 18px 20px" }}>
      {/* ยี่ห้อ — ตัวเล็ก ตัวพิมพ์ใหญ่ทั้งหมด */}
      {brand && (
        <p
          style={{
            margin: "0 0 6px",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: 10.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--accent)",
          }}
        >
          {brand}
        </p>
      )}

      <p
        style={{
          margin: "0 0 6px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11.5,
          color: "var(--text-dim)",
        }}
      >
        {category}
      </p>

      <h3
        style={{
          margin: "0 0 8px",
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: 15,
          color: "var(--text)",
          lineHeight: 1.35,
        }}
      >
        {name}
      </h3>

      <p
        style={{
          margin: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: 15,
          color: "var(--accent)",
        }}
      >
        {price}
      </p>
    </div>
  </a>
);

export default ProductCard;