import { useState, type CSSProperties, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuthStore } from "../stores/authStore";

function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const requestedPath = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const fallback = useAuthStore.getState().isAdmin ? "/admin" : "/profile";
      navigate(requestedPath || fallback, { replace: true });
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 401
        ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
        : caught instanceof Error ? caught.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="kw-auth-page" style={pageStyle}>
      <div className="kw-auth-card" style={{ maxWidth: 420, width: "100%" }}>
        <p className="kw-eyebrow">MEMBER ACCESS / SECURE</p>
        <Link to="/" style={logoStyle}>⌨ KEYWERK</Link>
        <h1 style={{ textAlign: "center" }}>เข้าสู่ระบบ</h1>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>อีเมล</label>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={inputStyle} />
          <label style={labelStyle}>รหัสผ่าน</label>
          <input type="password" autoComplete="current-password" minLength={4} value={password} onChange={(event) => setPassword(event.target.value)} required style={inputStyle} />
          {error ? <p role="alert" style={{ color: "#e85d5d" }}>{error}</p> : null}
          <button type="submit" disabled={submitting} style={submitStyle}>{submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button>
        </form>
        <p style={{ textAlign: "center", color: "var(--text-dim)", marginTop: "14px" }}>ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link></p>
      </div>
    </main>
  );
}

const pageStyle: CSSProperties = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg)", boxSizing: "border-box" };
const logoStyle: CSSProperties = { display: "block", marginBottom: 28, textAlign: "center", color: "var(--text)", textDecoration: "none", fontWeight: 800, fontFamily: "var(--font-sans)", fontSize: 20 };
const labelStyle: CSSProperties = { display: "block", marginBottom: 6, color: "var(--text-dim)" };
const inputStyle: CSSProperties = { width: "100%", padding: "12px 14px", marginBottom: 14, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" };
const submitStyle: CSSProperties = { width: "100%", padding: 13, marginTop: 8, border: 0, borderRadius: 8, background: "var(--accent)", color: "#1c1810", fontWeight: 800, cursor: "pointer" };

export default Login;
