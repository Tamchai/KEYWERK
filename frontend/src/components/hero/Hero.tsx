import { useState } from "react";
import heroImage from "../../assets/KEYWERK_Preview.png";

const KEY_ROW = ["ESC", "F1", "F2", "F3", "⌨", "Q", "W", "E", "R"];

export const Hero = () => {
  const [hover, setHover] = useState(false);

  return (
    <section
      style={{
        background: "var(--bg-alt)",
        width: "100vw",                        // ⬅️ เพิ่ม
        marginLeft: "calc(50% - 50vw)",         // ⬅️ เพิ่ม
        marginRight: "calc(50% - 50vw)",        // ⬅️ เพิ่ม
        padding: "clamp(16px, 4vw, 32px) clamp(20px, 5vw, 64px) clamp(48px, 7vw, 88px)",
        borderBottom: "1px solid var(--line)",
        boxSizing: "border-box",                // ⬅️ เพิ่ม กัน padding ดันความกว้างเกิน
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "clamp(32px, 6vw, 64px)",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div style={{ flex: "1 1 440px", minWidth: 280 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
            {KEY_ROW.map((k) => (
              <span
                key={k}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "var(--text-dim)",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 5,
                  padding: "6px 10px",
                  lineHeight: 1,
                }}
              >
                {k}
              </span>
            ))}
          </div>

          <h1
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: "clamp(34px, 5vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--text)",
              margin: "0 0 20px",
            }}
          >
            Every click
            <br />
            is an Experience.
          </h1>

          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 15,
              lineHeight: 1.7,
              color: "var(--text-dim)",
              margin: "0 0 32px",
              maxWidth: 480,
            }}
          >
            Pick your switch. Pick your sound.
            <br />
            Pick a typing experience you'll actually enjoy.
          </p>

        <a  
            href="#products"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "var(--accent)",
              color: "#1c1810",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 14,
              padding: "13px 22px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            ดูสินค้าทั้งหมด
            <span
              style={{
                display: "inline-flex",
                transition: "transform 0.15s ease",
                transform: hover ? "translateX(4px)" : "translateX(0)",
              }}
            >
              →
            </span>
          </a>
        </div>

        <div style={{ flex: "1 1 380px", minWidth: 260, display: "flex", justifyContent: "center" }}>
          <img
            src={heroImage}
            alt="คีย์บอร์ดเชิงกลหลากสี จัดวางแบบเรียงเหลื่อม"
            style={{
              width: "100%",
              maxWidth: 480,
              maxHeight: "60vh",
              height: "auto",
              objectFit: "contain",
              display: "block",
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,.5))",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;