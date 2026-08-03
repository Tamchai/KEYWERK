import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProductGridSection from "../components/products/ProductGridSection";

import dropmtsusuwatari from "../assets/Drop_MT_-Susuwatari.png";
import akkoworldtourtokyo from "../assets/Akko_World_Tour_Tokyo.png";
import gmkolivia from "../assets/GMK_Olivia_Full_Set.png";
import keywerlsakuraesc from "../assets/KEYWERK_Sakura_Esc_Cap.png";

// TODO: ใส่ path รูปจริงจาก src/assets/ แทน placeholder เหล่านี้
const KEYCAP_PRODUCTS = [
  {
    image: gmkolivia,
    brand: "GMK",
    category: "Artisan Keycap Set",
    name: "GMK Olivia Full Set",
    price: "฿4,200",
    href: "#",
  },
  {
    image: akkoworldtourtokyo,
    brand: "AKKO",
    category: "PBT Dye-Sub Keycap",
    name: "Akko World Tour Tokyo",
    price: "฿890",
    href: "#",
  },
  {
    image: dropmtsusuwatari,
    brand: "DROP",
    category: "Cherry Profile Keycap",
    name: "Drop MT3 Susuwatari",
    price: "฿3,100",
    href: "#",
  },
  {
    image: keywerlsakuraesc,
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