import { useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProductListing from "../components/products/ProductListing";

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
          padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 64px) 0",
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
            คำค้นหา: &quot;{query}&quot;
          </p>
        </div>
      </section>

      {query ? (
        <ProductListing title="ผลลัพธ์" search={query} />
      ) : (
        <section
          style={{
            background: "var(--bg)",
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
            boxSizing: "border-box",
            padding: "0 clamp(20px, 5vw, 64px) clamp(48px, 8vw, 96px)",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--text-dim)",
            }}
          >
            กรุณาระบุคำค้นหา
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}

export default SearchResults;
