import { useRef, useState, useEffect } from "react";
import { CategoryCard } from "./CategoryCard";
import keyboardImg from "../../assets/Keyboard.png";
import switchImg from "../../assets/Switch.png";
import keycapImg from "../../assets/Keycap.png";
import accessoriesImg from "../../assets/Accessories.png";
import allImg from "../../assets/All.png";

const CATEGORIES = [
  { image: keyboardImg, label: "Keyboard", description: "แมคคานิคอลและแมกเนติก", href: "/keyboard" },
  { image: switchImg, label: "Switch", description: "สวิตช์แมคคานิคอลและแมกเนติก", href: "/switches" },
  { image: keycapImg, label: "Keycap", description: "งานอาร์ติซานและโปรไฟล์ต่าง ๆ", href: "/keycaps" },
  { image: accessoriesImg, label: "Accessory", description: "ชุดหล่อลื่นและเครื่องมือ", href: "/accessories" },
  { image: allImg, label: "All Product", description: "ร้าน KEYWERK", href: "/search" },
];

export const CategorySection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, startScrollLeft: 0, moved: false });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    dragState.current = {
      startX: e.pageX,
      startScrollLeft: scrollRef.current.scrollLeft,
      moved: false,
    };
  };

  // ผูก mousemove/mouseup ไว้ที่ document แทน ไม่ให้หลุดตอนลากเร็ว
  useEffect(() => {
    if (!isDragging) return;

    const SPEED = 1.4; // ปรับความไวตอนลาก ยิ่งมากยิ่งลากไว

    const handleMove = (e: MouseEvent) => {
      if (!scrollRef.current) return;
      e.preventDefault();
      const delta = (e.pageX - dragState.current.startX) * SPEED;
      if (Math.abs(delta) > 4) dragState.current.moved = true;
      scrollRef.current.scrollLeft = dragState.current.startScrollLeft - delta;
    };

    const handleUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section
      className="kw-section kw-categories"
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
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 6px",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              01 / PRODUCT SYSTEM
            </p>
            <h2
              style={{
                margin: 0,
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                fontSize: "clamp(22px, 3vw, 28px)",
                color: "var(--text)",
              }}
            >
              เลือกชิ้นส่วนที่ใช่
            </h2>
          </div>

          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontSize: 12.5,
              color: "var(--text-dim)",
            }}
          >
            ตั้งแต่บอร์ดพร้อมใช้ ไปจนถึงชิ้นส่วนสำหรับประกอบเอง
          </p>
        </div>

        <div
          ref={scrollRef}
          className="category-scroll"
          onMouseDown={handleMouseDown}
          onClickCapture={handleClickCapture}
          style={{
            display: "flex",
            gap: 20,
            overflowX: "auto",
            scrollSnapType: isDragging ? "none" : "x mandatory",
            scrollBehavior: isDragging ? "auto" : "smooth",
            paddingTop: 8,
            paddingBottom: 8,
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: isDragging ? "none" : "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.label} {...cat} />
          ))}
        </div>
      </div>

      <style>{`
        .category-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default CategorySection;
