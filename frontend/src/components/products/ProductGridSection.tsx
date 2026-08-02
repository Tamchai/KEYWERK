import { ProductCard } from "./ProductCard";

interface Product {
  image: string;
  category: string;
  brand?: string;
  name: string;
  price: string;
  href: string;
}

interface ProductGridSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  products: Product[];
}

export const ProductGridSection = ({ id, title, subtitle, products }: ProductGridSectionProps) => (
  <section
    id={id}
    style={{
      background: "var(--bg)",
      width: "100vw",
      marginLeft: "calc(50% - 50vw)",
      marginRight: "calc(50% - 50vw)",
      boxSizing: "border-box",
      padding: "clamp(32px, 5vw, 56px) clamp(20px, 5vw, 64px)",
      borderBottom: "1px solid var(--line)",
      scrollMarginTop: 80, // กันหัวข้อโดนซ่อนใต้ sticky navbar ตอน scroll มาจาก dropdown
    }}
  >
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            margin: subtitle ? "0 0 6px" : 0,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 800,
            fontSize: "clamp(22px, 3vw, 28px)",
            color: "var(--text)",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              color: "var(--text-dim)",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        {products.map((p) => (
          <ProductCard key={p.name} {...p} />
        ))}
      </div>
    </div>
  </section>
);

export default ProductGridSection;