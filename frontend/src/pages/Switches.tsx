import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProductGridSection from "../components/products/ProductGridSection";

const SWITCH_PRODUCTS = [
  {
    image: "/placeholder-switch-1.png",
    brand: "GATERON",
    category: "Linear Switch",
    name: "Gateron Yellow Pro",
    price: "฿450",
    href: "#",
  },
  {
    image: "/placeholder-switch-2.png",
    brand: "AKKO",
    category: "Tactile Switch",
    name: "Akko CS Radiant Red",
    price: "฿520",
    href: "#",
  },
];

function Switches() {
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
          padding: "clamp(32px, 6vw, 56px) clamp(20px, 5vw, 64px) 0",
        }}
      >

      </section>

      <ProductGridSection title="สินค้าทั้งหมด" products={SWITCH_PRODUCTS} />

      <Footer />
    </>
  );
}

export default Switches;