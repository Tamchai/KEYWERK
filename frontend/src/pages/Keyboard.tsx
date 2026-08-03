import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProductGridSection from "../components/products/ProductGridSection";

import akko5075Img from "../assets/Akko_5075B_Plus.png";
import keychronV1Img from "../assets/Keychron_V1_Max.png";
import razerBlackWidowImg from "../assets/Razer_BlackWidow_V4_X.png";
import steelseriesImg from "../assets/SteelSeries_Apex_Pro_TKL_Gen_3.png";

// TODO: ยังไม่มีไฟล์รูปจริง — หามาวางที่ src/assets/ ตามชื่อไฟล์ด้านล่างนี้ได้เลย
import woottingImg from "../assets/Wooting_60HE.png";
import keychronQ1Img from "../assets/Keychron_Q1_HE.png";
import nuphyAir75Img from "../assets/NuPhy_Air75_V2_HE.png";
import gmmkProImg from "../assets/GMMK_Pro_HE.png";

import keywerkOrigin65Img from "../assets/KEYWERK_Origin_65.png";
import keywerkAurora75Img from "../assets/KEYWERK_Aurora_75.png";
import keywerkTerraTklImg from "../assets/KEYWERK_Terra_TKL.png";
import keywerkNovaFullImg from "../assets/KEYWERK_Nova_FullSize.png";
import keywerkEcho60Img from "../assets/KEYWERK_Echo_60.png";
import keywerkVertex96Img from "../assets/KEYWERK_Vertex_96.png";

const MECHANICAL_PRODUCTS = [
  {
    image: akko5075Img,
    brand: "AKKO",
    category: "96% Mechanical",
    name: "Akko 5075B Plus",
    price: "฿3,000",
    href: "#",
  },
  {
    image: keychronV1Img,
    brand: "KEYCHRON",
    category: "75% Mechanical",
    name: "Keychron V1 Max",
    price: "฿3,300",
    href: "#",
  },
  {
    image: razerBlackWidowImg,
    brand: "RAZER",
    category: "Full Size Mechanical Gaming",
    name: "Razer BlackWidow V4 X",
    price: "฿4,000",
    href: "#",
  },
];

const MAGNETIC_PRODUCTS = [
  {
    image: steelseriesImg,
    brand: "STEELSERIES",
    category: "TKL (80%) Hall Effect Gaming",
    name: "SteelSeries Apex Pro TKL Gen 3",
    price: "฿9,900",
    href: "#",
  },
  {
    image: woottingImg,
    brand: "WOOTING",
    category: "60% Magnetic (Hall Effect)",
    name: "Wooting 60HE+",
    price: "฿6,900",
    href: "#",
  },
  {
    image: keychronQ1Img,
    brand: "KEYCHRON",
    category: "75% Magnetic (Hall Effect)",
    name: "Keychron Q1 HE",
    price: "฿7,500",
    href: "#",
  },
  {
    image: nuphyAir75Img,
    brand: "NUPHY",
    category: "75% Magnetic (Hall Effect)",
    name: "NuPhy Air75 V2 HE",
    price: "฿6,500",
    href: "#",
  },
  {
    image: gmmkProImg,
    brand: "GLORIOUS",
    category: "75% Magnetic (Hall Effect)",
    name: "GMMK Pro HE",
    price: "฿8,200",
    href: "#",
  },
];

const CUSTOM_PRODUCTS = [
  {
    image: keywerkOrigin65Img,
    brand: "KEYWERK",
    category: "Custom Barebone Kit",
    name: "KEYWERK Origin 65 Barebone",
    price: "฿5,500",
    href: "#",
  },
  {
    image: keywerkAurora75Img,
    brand: "KEYWERK",
    category: "Custom Barebone Kit",
    name: "KEYWERK Aurora 75 Barebone",
    price: "฿6,200",
    href: "#",
  },
  {
    image: keywerkTerraTklImg,
    brand: "KEYWERK",
    category: "Custom Barebone Kit",
    name: "KEYWERK Terra TKL Barebone",
    price: "฿5,900",
    href: "#",
  },
  {
    image: keywerkNovaFullImg,
    brand: "KEYWERK",
    category: "Custom Barebone Kit",
    name: "KEYWERK Nova Full Size Barebone",
    price: "฿6,800",
    href: "#",
  },
  {
    image: keywerkEcho60Img,
    brand: "KEYWERK",
    category: "Custom Barebone Kit",
    name: "KEYWERK Echo 60 Barebone",
    price: "฿4,900",
    href: "#",
  },
  {
    image: keywerkVertex96Img,
    brand: "KEYWERK",
    category: "Custom Barebone Kit",
    name: "KEYWERK Vertex 96 Barebone",
    price: "฿7,200",
    href: "#",
  },
];

function Keyboard() {
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
        id="mechanical"
        title="Mechanical"
        subtitle="คีย์บอร์ดกลไกแบบดั้งเดิม เสียงและสัมผัสเป็นเอกลักษณ์"
        products={MECHANICAL_PRODUCTS}
      />
      <ProductGridSection
        id="magnetic"
        title="Magnetic"
        subtitle="ระบบ Hall Effect ตอบสนองไว ปรับ actuation point ได้"
        products={MAGNETIC_PRODUCTS}
      />
      <ProductGridSection
        id="custom"
        title="Custom"
        subtitle="ชุดประกอบเองสำหรับสาย DIY"
        products={CUSTOM_PRODUCTS}
      />

      <Footer />
    </>
  );
}

export default Keyboard;