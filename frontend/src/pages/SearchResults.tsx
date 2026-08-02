import { useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";

  return (
    <>
      <Navbar />
      <section
        style={{
          background: "var(--bg)",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          boxSizing: "border-box",
          padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 64px)",
          minHeight: "60vh",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: "clamp(24px, 4vw, 32px)",
              color: "var(--text)",
              margin: "0 0 8px",
            }}
          >
            ผลการค้นหา
          </h1>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              color: "var(--text-dim)",
              margin: 0,
            }}
          >
            คำค้นหา: "{query}"
          </p>
          {/* TODO: ต่อ logic กรองสินค้าจริงจาก query ตรงนี้ */}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default SearchResults;