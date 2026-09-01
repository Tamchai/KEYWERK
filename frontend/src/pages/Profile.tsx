import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function Profile() {
  const email = useAuthStore((s) => s.email);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
          padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 64px)",
          minHeight: "60vh",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 40px)",
              color: "var(--text)",
              margin: "0 0 16px",
            }}
          >
            โปรไฟล์ของฉัน
          </h1>

          {email && (
            <p
              style={{
                margin: "0 0 8px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                color: "var(--text-dim)",
              }}
            >
              {email}
            </p>
          )}

          <button
            onClick={handleLogout}
            style={{
              marginTop: 20,
              padding: "10px 18px",
              background: "transparent",
              color: "var(--text-dim)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ออกจากระบบ
          </button>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Profile;
