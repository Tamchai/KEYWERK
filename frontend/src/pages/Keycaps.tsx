import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProductGridSection from "../components/products/ProductGridSection";

// TODO: ใส่ path รูปจริงจาก src/assets/ แทน placeholder เหล่านี้
const KEYCAP_PRODUCTS = [
  {
    image: "/placeholder-keycap-1.png",
    brand: "GMK",
    category: "Artisan Keycap Set",
    name: "GMK Olivia Full Set",
    price: "฿4,200",
    href: "#",
  },
  {
    image: "/placeholder-keycap-2.png",
    brand: "AKKO",
    category: "PBT Dye-Sub Keycap",
    name: "Akko World Tour Tokyo",
    price: "฿890",
    href: "#",
  },
  {
    image: "/placeholder-keycap-3.png",
    brand: "DROP",
    category: "Cherry Profile Keycap",
    name: "Drop MT3 Susuwatari",
    price: "฿3,100",
    href: "#",
  },
  {
    image: "/placeholder-keycap-4.png",
    brand: "KEYWERK",
    category: "Artisan Single Keycap",
    name: "KEYWERK Sakura Esc Cap",
    price: "฿650",
    href: "#",
  },
];

function Keycaps() {
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

      <ProductGridSection
        title="สินค้าทั้งหมด"
        subtitle="Artisan, Profile ต่างๆ และชุดคีย์แคปสำหรับทุกเลย์เอาต์"
        products={KEYCAP_PRODUCTS}
      />

      <Footer />
    </>
  );
}

export default Keycaps;