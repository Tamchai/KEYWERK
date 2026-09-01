import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProductListing from "../components/products/ProductListing";

const KEYBOARD_SECTIONS = [
  {
    id: "mechanical",
    categoryName: "Mechanical",
    title: "Mechanical",
    subtitle: "คีย์บอร์ดกลไกแบบดั้งเดิม เสียงและสัมผัสเป็นเอกลักษณ์",
  },
  {
    id: "magnetic",
    categoryName: "Magnetic",
    title: "Magnetic",
    subtitle: "ระบบ Hall Effect ตอบสนองไว ปรับ actuation point ได้",
  },
  {
    id: "custom",
    categoryName: "Custom",
    title: "Custom",
    subtitle: "ชุดประกอบเองสำหรับสาย DIY",
  },
];

function Keyboard() {
  return (
    <>
      <Navbar />

      {KEYBOARD_SECTIONS.map((section) => (
        <ProductListing
          key={section.id}
          id={section.id}
          title={section.title}
          subtitle={section.subtitle}
          categoryName={section.categoryName}
        />
      ))}

      <Footer />
    </>
  );
}

export default Keyboard;
