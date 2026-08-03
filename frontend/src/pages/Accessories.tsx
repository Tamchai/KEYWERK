import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProductGridSection from "../components/products/ProductGridSection";

import keywerkswlubekit from "../assets/KEYWERK_Switch_Lube_Kit.png";
import swandkppuller from "../assets/Switch_&_Keycap_Puller.png";
import akkousbc from "../assets/Akko_USB_C_Coiled_Cable.png";
import keywerkdeskmat from "../assets/KEYWERK_Deskmat_XL.png";
import durockstabilizerv2 from "../assets/Durock_V2_Screw_in_Stabilizer.png";

// TODO: ใส่ path รูปจริงจาก src/assets/ แทน placeholder เหล่านี้
const ACCESSORY_PRODUCTS = [
  {
    image: keywerkswlubekit,
    brand: "KEYWERK",
    category: "Lube Station",
    name: "KEYWERK Switch Lube Kit",
    price: "฿890",
    href: "#",
  },
  {
    image: swandkppuller,
    brand: "GATERON",
    category: "Switch & Keycap Puller",
    name: "Gateron 2-in-1 Puller",
    price: "฿150",
    href: "#",
  },
  {
    image: akkousbc,
    brand: "AKKO",
    category: "Coiled Cable",
    name: "Akko USB-C Coiled Cable",
    price: "฿590",
    href: "#",
  },
  {
    image: keywerkdeskmat,
    brand: "KEYWERK",
    category: "Desk Mat",
    name: "KEYWERK Deskmat XL",
    price: "฿450",
    href: "#",
  },
  {
    image: durockstabilizerv2,
    brand: "DUROCK",
    category: "Stabilizer Set",
    name: "Durock V2 Screw-in Stabilizer",
    price: "฿390",
    href: "#",
  },
];

function Accessories() {
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
        subtitle="Lube Station, Tools และของเสริมสำหรับสายประกอบเอง"
        products={ACCESSORY_PRODUCTS}
      />

      <Footer />
    </>
  );
}

export default Accessories;