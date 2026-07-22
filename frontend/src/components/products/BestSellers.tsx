import { ProductCard } from "./ProductCard";
import keychronImg from "../../assets/Keychron_V1_Max.png";
import akkoImg from "../../assets/Akko_5075B_Plus.png";
import steelseriesImg from "../../assets/SteelSeries_Apex_Pro_TKL_Gen_3.png";
import razerImg from "../../assets/Razer_BlackWidow_V4_X.png";

const PRODUCTS = [
  {
    image: keychronImg,
    category: "75% Mechanical",
    name: "Keychron V1 Max",
    price: "฿3,300",
    href: "#keychron-v1-max",
  },
  {
    image: akkoImg,
    category: "96% Mechanical",
    name: "Akko 5075B Plus",
    price: "฿3,000",
    href: "#akko-5075b-plus",
  },
  {
    image: steelseriesImg,
    category: "TKL (80%) Hall Effect Gaming",
    name: "SteelSeries Apex Pro TKL Gen 3",
    price: "฿9,900",
    href: "#steelseries-apex-pro-tkl-gen-3",
  },
  {
    image: razerImg,
    category: "Full Size Mechanical Gaming",
    name: "Razer BlackWidow V4 X",
    price: "฿4,000",
    href: "#razer-blackwidow-v4-x",
  },
];

export const BestSellers = () => (
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
      {/* Header */}
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

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        {PRODUCTS.map((product) => (
          <ProductCard key={product.name} {...product} />
        ))}
      </div>
    </div>
  </section>
);

export default BestSellers;