export const Footer = () => (
  <footer
    style={{
      background: "var(--bg-alt)",
      width: "100vw",
      marginLeft: "calc(50% - 50vw)",
      marginRight: "calc(50% - 50vw)",
      boxSizing: "border-box",
      padding: "clamp(24px, 4vw, 32px) clamp(20px, 5vw, 64px)",
    }}
  >
    <div
      style={{
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13,
        color: "var(--text-dim)",
      }}
    >
      <p style={{ margin: 0 }}>
        <span style={{ color: "var(--text)", fontWeight: 700 }}>KEYWERK</span>
        {" · "}
        ทุกการกดคือประสบการณ์
      </p>

      <p style={{ margin: 0 }}>© 2026 KEYWERK. ออกแบบด้วยความรักในเสียงคลิก</p>
    </div>
  </footer>
);

export default Footer;