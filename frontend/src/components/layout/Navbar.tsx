import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface DropdownItem {
  emoji: string;
  label: string;
  href: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS: NavItem[] = [
  { label: "Home", href: "#", active: true },
  { label: "Switch", href: "#switches" },
  { label: "Keycaps", href: "#keycaps" },
  { label: "Contact", href: "#contact" },
];

const KEYBOARD_ITEMS: DropdownItem[] = [
  { emoji: "⌨️", label: "Mechanical", href: "#mechanical" },
  { emoji: "🧲", label: "Magnetic", href: "#magnetic" },
  { emoji: "🧩", label: "Custom", href: "#custom" },
];

const SEARCH_CHIPS = ["Gateron Yellow", "Hot-swap", "75% layout", "Wireless tri-mode", "PBT keycap"];

const QUICK_LINKS = [
  { emoji: "⌨️", label: "Mechanical Keyboard", href: "#mechanical" },
  { emoji: "🧲", label: "Magnetic Keyboard", href: "#magnetic" },
  { emoji: "🧩", label: "Custom Keyboard", href: "#custom" },
  { emoji: "🔘", label: "Switch", href: "#switches" },
  { emoji: "🔤", label: "Keycaps", href: "#keycaps" },
];

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
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

const KeyboardDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-dim)",
          fontFamily: "'Inter', sans-serif",
          fontSize: 13.5,
          padding: 0,
          transition: "color 0.15s",
        }}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
      >
        Keyboard
        <IconChevron open={open} />
      </button>

      {/* Dropdown panel */}
      <div
        role="menu"
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: open
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(6px)",
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
          <a
            key={item.href}
            href={item.href}
            role="menuitem"
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
          </a>
        ))}
      </div>
    </div>
  );
};

// ─── SearchPanel ──────────────────────────────────────────────────────────────

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
}

const SearchPanel = ({ open, onClose }: SearchPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

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
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        // signal parent to open — parent handles this
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Scrim */}
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

      {/* Panel */}
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
          {/* Search row */}
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

          {/* Suggestions */}
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
                  onClick={() => {
                    setQuery(chip);
                    inputRef.current?.focus();
                  }}
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
                <a
                  key={link.href + link.label}
                  href={link.href}
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
                </a>
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

  // Open search on "/" key
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

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
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
          <a
            href="#"
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
            {/* Keyboard icon — matches screenshot: amber keys on dark body */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
            >
              {/* Body */}
              <rect x="0.75" y="3.75" width="18.5" height="12.5" rx="2.25" fill="#2c2820" stroke="#3a352b" strokeWidth="1" />
              {/* Row 1 — 5 keys */}
              <rect x="2.5" y="5.5" width="2.5" height="2" rx="0.5" fill="#e8b923" />
              <rect x="5.5" y="5.5" width="2.5" height="2" rx="0.5" fill="#e8b923" />
              <rect x="8.5" y="5.5" width="2.5" height="2" rx="0.5" fill="#e8b923" />
              <rect x="11.5" y="5.5" width="2.5" height="2" rx="0.5" fill="#e8b923" />
              <rect x="14.5" y="5.5" width="3" height="2" rx="0.5" fill="#e8b923" />
              {/* Row 2 — 5 keys */}
              <rect x="2.5" y="8.25" width="2.5" height="2" rx="0.5" fill="#e8b923" />
              <rect x="5.5" y="8.25" width="2.5" height="2" rx="0.5" fill="#e8b923" />
              <rect x="8.5" y="8.25" width="2.5" height="2" rx="0.5" fill="#e8b923" />
              <rect x="11.5" y="8.25" width="2.5" height="2" rx="0.5" fill="#e8b923" />
              <rect x="14.5" y="8.25" width="3" height="2" rx="0.5" fill="#e8b923" />
              {/* Row 3 — spacebar */}
              <rect x="2.5" y="11" width="15" height="2" rx="0.5" fill="#e8b923" />
            </svg>
            KEYWERK
          </a>

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
            {NAV_LINKS.slice(0, 1).map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                style={{
                  color: link.active ? "var(--accent)" : "var(--text-dim)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {link.label}
              </a>
            ))}

            <KeyboardDropdown />

            {NAV_LINKS.slice(1).map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                style={{
                  color: "var(--text-dim)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")}
              >
                {link.label}
              </a>
            ))}
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
                width: 19,
                height: 19,
                transition: "color 0.15s, transform 0.1s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <IconSearch />
            </button>

            {/* User */}
            <button
              aria-label="บัญชีผู้ใช้"
              style={{
                background: "none",
                border: "none",
                color: "var(--text)",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 19,
                height: 19,
                transition: "color 0.15s, transform 0.1s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <IconUser />
            </button>

            {/* Cart */}
            <button
              aria-label="ตะกร้าสินค้า"
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
                width: 19,
                height: 19,
                transition: "color 0.15s, transform 0.1s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <IconCart />
              {cartCount > 0 && (
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