import type { CSSProperties } from "react";

export const fieldStyle: CSSProperties = { width: "100%", padding: "10px 12px", marginBottom: 12, borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: 13.5, boxSizing: "border-box" };
export const labelStyle: CSSProperties = { display: "block", margin: "0 0 6px", fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" };
export const primaryBtn: CSSProperties = { padding: "9px 16px", background: "var(--accent)", color: "#1c1810", border: "none", borderRadius: 8, fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13, cursor: "pointer" };
export const ghostBtn: CSSProperties = { padding: "9px 16px", background: "transparent", color: "var(--text-dim)", border: "1px solid var(--line)", borderRadius: 8, fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer" };
export const dangerBtn: CSSProperties = { padding: "8px 12px", background: "transparent", color: "#e85d5d", border: "1px solid rgba(232,93,93,.4)", borderRadius: 6, fontFamily: "var(--font-sans)", fontSize: 12.5, cursor: "pointer" };
export const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)", fontSize: 13 };
export const thStyle: CSSProperties = { textAlign: "left", padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--text-dim)", fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" };
export const tdStyle: CSSProperties = { padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--text)" };
