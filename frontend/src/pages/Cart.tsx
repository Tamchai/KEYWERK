import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function Cart() {
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
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 40px)",
              color: "var(--text)",
              margin: 0,
            }}
          >
            ตะกร้าสินค้า
          </h1>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Cart;