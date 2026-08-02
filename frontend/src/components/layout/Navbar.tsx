import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
}

interface DropdownItem {
  emoji: string;
  label: string;
  href: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS: NavItem[] = [
  { label: "Switch", href: "/switches" },
  { label: "Keycaps", href: "/keycaps" },
  { label: "Accessories", href: "/accessories" },
  { label: "About", href: "/about" },
];

const KEYBOARD_ITEMS: DropdownItem[] = [
  { emoji: "⌨️", label: "Mechanical", href: "/keyboard#mechanical" },
  { emoji: "🧲", label: "Magnetic", href: "/keyboard#magnetic" },
  { emoji: "🧩", label: "Custom", href: "/keyboard#custom" },
];

const SEARCH_CHIPS = ["Gateron Yellow", "Hot-swap", "75% layout", "Wireless tri-mode", "PBT keycap"];

const QUICK_LINKS = [
  { emoji: "⌨️", label: "Mechanical Keyboard", href: "/keyboard" },
  { emoji: "🧩", label: "Custom Keyboard", href: "/keyboard#custom" },
  { emoji: "🔘", label: "Switch", href: "/switches" },
  { emoji: "🔤", label: "Keycaps", href: "/keycaps" },
];

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: "100%", height: "100%" }}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
  </svg>
);

const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6" />
    <circle cx="10" cy="21" r="1" />
    <circle cx="17" cy="21" r="1" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      width: 11,
      height: 11,
      transition: "transform 0.15s ease",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── KeyboardDropdown ─────────────────────────────────────────────────────────
// ปรับ: ตัวข้อความ "Keyboard" กดแล้วไปหน้า /keyboard ได้จริง
// ส่วน chevron แยกเป็นปุ่มกดเปิด/ปิด dropdown ต่างหาก (สำหรับ mobile/touch ที่ hover ไม่ทำงาน)

const KeyboardDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { pathname } = useLocation();
  const isActive = pathname.startsWith("/keyboard");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ยกเลิก timer ที่ค้างไว้ตอน unmount กัน memory leak
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const openMenu = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };

  // หน่วงเวลาก่อนปิด แทนที่จะปิดทันที — ให้เวลาผู้ใช้ขยับเมาส์ข้ามช่องว่างไป dropdown
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <div
      ref={ref}
      style={{ position: "relative", display: "flex", alignItems: "center", gap: 4 }}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <Link
        to="/keyboard"
        style={{
          color: isActive ? "var(--accent)" : "var(--text-dim)",
          textDecoration: "none",
          fontSize: 13.5,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => !isActive && ((e.currentTarget as HTMLElement).style.color = "var(--text)")}
        onMouseLeave={(e) => !isActive && ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")}
      >
        Keyboard
      </Link>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="เปิดเมนูย่อยคีย์บอร์ด"
        style={{
          display: "flex",
          alignItems: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-dim)",
          padding: 2,
        }}
      >
        <IconChevron open={open} />
      </button>

      {/* Dropdown panel */}
      <div
        role="menu"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: open ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(6px)",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          padding: 6,
          minWidth: 172,
          marginTop: 14,
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.15s ease, transform 0.15s ease",
          boxShadow: "0 12px 28px rgba(0,0,0,.45)",
          zIndex: 5,
        }}
      >
        {KEYBOARD_ITEMS.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 10px",
              borderRadius: 5,
              fontSize: 13,
              color: "var(--text)",
              textDecoration: "none",
              transition: "background 0.12s, color 0.12s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--surface-top)";
              (e.currentTarget as HTMLElement).style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text)";
            }}
          >
            <span style={{ fontSize: 14 }}>{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

// ─── SearchPanel ──────────────────────────────────────────────────────────────
// ปรับ: กด Enter หรือคลิก chip แล้วค้นหาได้จริง (navigate ไป /search?q=...)

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
}

const SearchPanel = ({ open, onClose }: SearchPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const runSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    onClose();
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") runSearch(query);
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10,9,6,0.7)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.2s ease",
          zIndex: 60,
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "var(--bg-alt)",
          borderBottom: "1px solid var(--line)",
          zIndex: 61,
          transform: open ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
          padding: "28px 24px 32px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              borderBottom: "2px solid var(--line)",
              paddingBottom: 14,
            }}
          >
            <span style={{ width: 22, height: 22, color: "var(--text-dim)", flexShrink: 0, display: "flex" }}>
              <IconSearch />
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ค้นหาคีย์บอร์ด, switch, keycap..."
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 22,
                color: "var(--text)",
                caretColor: "var(--accent)",
              }}
            />
            <button
              onClick={() => runSearch(query)}
              style={{
                background: "var(--accent)",
                border: "none",
                color: "#1c1810",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: 12,
                padding: "8px 14px",
                borderRadius: 6,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ค้นหา
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "1px solid var(--line)",
                color: "var(--text-dim)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                padding: "6px 10px",
                borderRadius: 5,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ESC
            </button>
          </div>

          <div style={{ marginTop: 22 }}>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}
            >
              ค้นหายอดฮิต
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
              {SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => runSearch(chip)}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12.5,
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    color: "var(--text)",
                    padding: "8px 14px",
                    borderRadius: 20,
                    cursor: "pointer",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text)";
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}
            >
              ไปที่หมวดหมู่
            </p>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href + link.label}
                  to={link.href}
                  onClick={onClose}
                  style={{
                    fontSize: 13.5,
                    color: "var(--text-dim)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")}
                >
                  {link.emoji} {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────

interface NavbarProps {
  cartCount?: number;
}

export const Navbar = ({ cartCount = 0 }: NavbarProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // User icon: login แล้วไป /profile, ยังไม่ login ไป /login
  const handleUserClick = () => {
    navigate(isLoggedIn ? "/profile" : "/login");
  };

  // Cart icon: ต้อง login ก่อนถึงเข้าได้ ไม่งั้นเด้งไป /login (พร้อมจดจำว่าจะกลับมาที่ /cart)
  const handleCartClick = () => {
    if (isLoggedIn) {
      navigate("/cart");
    } else {
      navigate("/login", { state: { from: "/cart" } });
    }
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          background: "rgba(17,15,10,0.92)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <nav
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px clamp(20px, 5vw, 64px)",
            gap: 24,
            boxSizing: "border-box",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: 19,
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--text)",
              textDecoration: "none",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
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

          {/* Nav links */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "clamp(18px,2vw,42px)",
              minWidth: 0,
              fontSize: 14,
            }}
          >
            <Link
              to="/"
              style={{
                color: pathname === "/" ? "var(--accent)" : "var(--text-dim)",
                textDecoration: "none",
                transition: "color 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = pathname === "/" ? "var(--accent)" : "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = pathname === "/" ? "var(--accent)" : "var(--text-dim)")}
            >
              Home
            </Link>

            <KeyboardDropdown />

            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  style={{
                    color: isActive ? "var(--accent)" : "var(--text-dim)",
                    textDecoration: "none",
                    transition: "color 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = isActive ? "var(--accent)" : "var(--text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? "var(--accent)" : "var(--text-dim)")}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Icon buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="ค้นหา"
              title="ค้นหา  (/)"
              style={{
                background: "none",
                border: "none",
                color: "var(--text)",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                transition: "color 0.15s, transform 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <IconSearch />
            </button>

            {/* User — login แล้วไปโปรไฟล์, ยังไม่ login ไปหน้า login */}
            <button
              onClick={handleUserClick}
              aria-label={isLoggedIn ? "โปรไฟล์ของฉัน" : "เข้าสู่ระบบ"}
              title={isLoggedIn ? "โปรไฟล์ของฉัน" : "เข้าสู่ระบบ"}
              style={{
                background: "none",
                border: "none",
                color: isLoggedIn ? "var(--accent)" : "var(--text)",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                transition: "color 0.15s, transform 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <IconUser />
            </button>

            {/* Cart — ต้อง login ก่อนถึงเข้าได้ */}
            <button
              onClick={handleCartClick}
              aria-label="ตะกร้าสินค้า"
              title={isLoggedIn ? "ตะกร้าสินค้า" : "เข้าสู่ระบบเพื่อดูตะกร้า"}
              style={{
                background: "none",
                border: "none",
                color: "var(--text)",
                cursor: "pointer",
                padding: 4,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                transition: "color 0.15s, transform 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <IconCart />
              {isLoggedIn && cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -8,
                    background: "var(--accent)",
                    color: "#1c1810",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: 10,
                    lineHeight: 1,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;