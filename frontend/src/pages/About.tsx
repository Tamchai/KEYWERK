import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function About() {
  return (
    <>
      <Navbar />

      {/* ─── Section 1: About KEYWERK ─────────────────────────────────────── */}
      <section
        style={{
          background: "var(--bg)",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          boxSizing: "border-box",
          padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 64px)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Label */}
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 12px",
            }}
          >
            About us
          </p>

          <h1
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 40px)",
              color: "var(--text)",
              margin: "0 0 24px",
              lineHeight: 1.2,
            }}
          >
            KEYWERK คืออะไร?
          </h1>

          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 15,
              color: "var(--text-dim)",
              lineHeight: 1.8,
              margin: "0 0 20px",
            }}
          >
            KEYWERK คือร้านค้าออนไลน์สำหรับคนที่หลงใหลในโลกของ mechanical keyboard
            ตั้งแต่ผู้เริ่มต้นที่อยากได้บอร์ดพร้อมใช้ ไปจนถึงนักสะสมที่ต้องการ
            ชิ้นส่วนสำหรับ custom build โดยเฉพาะ
          </p>

          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 15,
              color: "var(--text-dim)",
              lineHeight: 1.8,
              margin: "0 0 48px",
            }}
          >
            เราคัดสรรสินค้าคุณภาพทั้ง keyboard, switch, keycap และอุปกรณ์เสริม
            จากแบรนด์ชั้นนำทั่วโลก พร้อมบริการจัดส่งทั่วไทย
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "clamp(24px, 5vw, 56px)",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "500+", label: "สินค้าในคลัง" },
              { value: "50+", label: "แบรนด์ที่คัดสรร" },
              { value: "24h", label: "จัดส่งภายใน" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 800,
                    fontSize: "clamp(28px, 4vw, 36px)",
                    color: "var(--accent)",
                    margin: "0 0 4px",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: "var(--text-dim)",
                    margin: 0,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 2: Contact ───────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--bg-alt)",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          boxSizing: "border-box",
          padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 64px)",
          minHeight: "40vh",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 12px",
            }}
          >
            Contact
          </p>

          <h2
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: "clamp(22px, 3vw, 32px)",
              color: "var(--text)",
              margin: "0 0 32px",
            }}
          >
            ติดต่อเราได้ที่นี่
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { emoji: "📧", label: "Email", value: "hello@keywerk.co" },
              { emoji: "💬", label: "LINE OA", value: "@keywerk" },
              { emoji: "📸", label: "Instagram", value: "@keywerk.co" },
              { emoji: "📦", label: "จัดส่ง", value: "ทั่วประเทศไทย — Kerry / Flash" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                }}
              >
                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                <div>
                  <p
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      margin: "0 0 2px",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 14,
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default About;