import { useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>(() => document.documentElement.dataset.theme === "light" ? "light" : "dark");

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("keywerk-theme", next); } catch { /* private browsing */ }
    setTheme(next);
  };

  return <button type="button" className="kw-theme-toggle" onClick={toggle} aria-label={theme === "dark" ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"} title={theme === "dark" ? "ธีมสว่าง" : "ธีมมืด"} aria-pressed={theme === "light"}>
    {theme === "dark" ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
    {!compact ? <span>{theme === "dark" ? "ธีมสว่าง" : "ธีมมืด"}</span> : null}
  </button>;
}
