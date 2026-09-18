import { useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

function Register() {
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, confirm_password: confirmPassword });
      navigate("/profile", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 380, width: "100%" }}>
        <Link to="/" style={logoStyle}>⌨ KEYWERK</Link>
        <h1 style={{ textAlign: "center" }}>สมัครสมาชิก</h1>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>ชื่อ</label>
          <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required style={inputStyle} />
          <label style={labelStyle}>อีเมล</label>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={inputStyle} />
          <label style={labelStyle}>รหัสผ่าน</label>
          <input type="password" autoComplete="new-password" minLength={4} value={password} onChange={(event) => setPassword(event.target.value)} required style={inputStyle} />
          <label style={labelStyle}>ยืนยันรหัสผ่าน</label>
          <input type="password" autoComplete="new-password" minLength={4} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required style={inputStyle} />
          {error ? <p role="alert" style={{ color: "#e85d5d" }}>{error}</p> : null}
          <button type="submit" disabled={submitting} style={submitStyle}>{submitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}</button>
        </form>
        <p style={{ textAlign: "center", color: "var(--text-dim)" }}>มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link></p>
      </div>
    </main>
  );
}

const pageStyle: CSSProperties = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg)", boxSizing: "border-box" };
const logoStyle: CSSProperties = { display: "block", marginBottom: 28, textAlign: "center", color: "var(--text)", textDecoration: "none", fontWeight: 800, fontFamily: "var(--font-sans)", fontSize: 20 };
const labelStyle: CSSProperties = { display: "block", marginBottom: 6, color: "var(--text-dim)" };
const inputStyle: CSSProperties = { width: "100%", padding: "12px 14px", marginBottom: 14, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" };
const submitStyle: CSSProperties = { width: "100%", padding: 13, marginTop: 8, border: 0, borderRadius: 8, background: "var(--accent)", color: "#1c1810", fontWeight: 800, cursor: "pointer" };

export default Register;
