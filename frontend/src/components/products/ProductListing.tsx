import type { CSSProperties } from "react";
import ProductGridSection from "./ProductGridSection";
import { useDisplayProductsQuery } from "../../hooks/queries/useCatalogQueries";

interface ProductListingProps {
  id?: string;
  title: string;
  subtitle?: string;
  categoryName?: string;
  search?: string;
  limit?: number;
  sortBySold?: boolean;
}

const mono: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
};

export const ProductListing = ({
  id,
  title,
  subtitle,
  categoryName,
  search,
  limit,
  sortBySold,
}: ProductListingProps) => {
  const { products, isLoading, isError, error } = useDisplayProductsQuery({
    categoryName,
    search,
    limit,
    sortBySold,
  });

  if (isLoading) {
    return (
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
          scrollMarginTop: 80,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", ...mono, color: "var(--text-dim)" }}>
          กำลังโหลดสินค้า...
        </div>
      </section>
    );
  }

  if (isError) {
    return (
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
          scrollMarginTop: 80,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", ...mono, color: "#e85d5d" }}>
          {error || "เกิดข้อผิดพลาด"}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
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
          scrollMarginTop: 80,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 8px", ...mono, fontWeight: 800, fontSize: 28, color: "var(--text)" }}>
            {title}
          </h2>
          <p style={{ margin: 0, ...mono, fontSize: 14, color: "var(--text-dim)" }}>
            ยังไม่มีสินค้าในหมวดนี้
          </p>
        </div>
      </section>
    );
  }

  return (
    <ProductGridSection id={id} title={title} subtitle={subtitle} products={products} />
  );
};

export default ProductListing;
