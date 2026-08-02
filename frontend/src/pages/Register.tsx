import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = () => {
    // mock — สมัครแล้ว login ให้เลย
    login();
    navigate("/profile", { replace: true });
  };

  return (
    <div
      style={{
        background: "var(--bg)",
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 360, width: "100%" }}>
        <Link
          to="/"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginBottom: 32,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 800,
            fontSize: 19,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            textDecoration: "none",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.75" y="3.75" width="18.5" height="12.5" rx="2.25" fill="#2c2820" stroke="#3a352b" strokeWidth="1" />
            <rect x="2.5" y="5.5" width="2.5" height="2" rx="0.5" fill="#e8b923" />
            <rect x="5.5" y="5.5" width="2.5" height="2" rx="0.5" fill="#e8b923" />
            <rect x="8.5" y="5.5" width="2.5" height="2" rx="0.5" fill="#e8b923" />
            <rect x="11.5" y="5.5" width="2.5" height="2" rx="0.5" fill="#e8b923" />
            <rect x="14.5" y="5.5" width="3" height="2" rx="0.5" fill="#e8b923" />
            <rect x="2.5" y="8.25" width="2.5" height="2" rx="0.5" fill="#e8b923" />
            <rect x="5.5" y="8.25" width="2.5" height="2" rx="0.5" fill="#e8b923" />
            <rect x="8.5" y="8.25" width="2.5" height="2" rx="0.5" fill="#e8b923" />
            <rect x="11.5" y="8.25" width="2.5" height="2" rx="0.5" fill="#e8b923" />
            <rect x="14.5" y="8.25" width="3" height="2" rx="0.5" fill="#e8b923" />
            <rect x="2.5" y="11" width="15" height="2" rx="0.5" fill="#e8b923" />
          </svg>
          KEYWERK
        </Link>

        <h1
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 800,
            fontSize: "clamp(24px, 4vw, 32px)",
            color: "var(--text)",
            margin: "0 0 24px",
            textAlign: "center",
          }}
        >
          สมัครสมาชิก
        </h1>

        <input
          type="text"
          placeholder="ชื่อ"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 12,
            borderRadius: 8,
            border: "1px solid var(--line)",
            background: "var(--surface)",
            color: "var(--text)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />
        <input
          type="email"
          placeholder="อีเมล"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 12,
            borderRadius: 8,
            border: "1px solid var(--line)",
            background: "var(--surface)",
            color: "var(--text)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />
        <input
          type="password"
          placeholder="รหัสผ่าน"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 20,
            borderRadius: 8,
            border: "1px solid var(--line)",
            background: "var(--surface)",
            color: "var(--text)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={handleRegister}
          style={{
            width: "100%",
            padding: "13px 22px",
            background: "var(--accent)",
            color: "#1c1810",
            border: "none",
            borderRadius: 8,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          สมัครสมาชิก
        </button>

        <p
          style={{
            marginTop: 20,
            textAlign: "center",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            color: "var(--text-dim)",
          }}
        >
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;