import { ProductCard } from "./ProductCard";
import { useDisplayProductsQuery } from "../../hooks/queries/useCatalogQueries";

export const BestSellers = () => {
  const { products, isLoading, isError, error } = useDisplayProductsQuery({
    sortBySold: true,
    limit: 4,
  });

  return (
    <section
      style={{
        background: "var(--bg)",
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
        boxSizing: "border-box",
        padding: "clamp(32px, 5vw, 56px) clamp(20px, 5vw, 64px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              margin: "0 0 6px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Best sellers
          </p>
          <h2
            style={{
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: "clamp(22px, 3vw, 28px)",
              color: "var(--text)",
            }}
          >
            สินค้าแนะนำ
          </h2>
        </div>

        {isLoading && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-dim)" }}>
            กำลังโหลดสินค้า...
          </p>
        )}

        {isError && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e85d5d" }}>{error}</p>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-dim)" }}>
            ยังไม่มีสินค้าแนะนำ
          </p>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;
