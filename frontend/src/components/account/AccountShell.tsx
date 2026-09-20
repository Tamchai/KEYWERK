import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { MapPin, Package, UserRound } from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export default function AccountShell({ title, children }: { title: string; children: ReactNode }) {
  return <><Navbar /><main className="kw-account-shell"><div className="kw-account-frame">
    <header className="kw-account-heading">
      <div className="kw-account-heading-copy"><div className="kw-account-kicker"><span className="kw-account-key">K</span><span>พื้นที่สมาชิก KEYWERK</span></div><h1 className="kw-page-title">{title}</h1><p>จัดการข้อมูลส่วนตัว ที่อยู่จัดส่ง และคำสั่งซื้อในที่เดียว</p></div>
      <nav className="kw-account-nav" aria-label="เมนูบัญชีสมาชิก"><NavLink to="/profile"><UserRound size={18} />บัญชี</NavLink><NavLink to="/addresses"><MapPin size={18} />ที่อยู่</NavLink><NavLink to="/orders"><Package size={18} />คำสั่งซื้อ</NavLink></nav>
    </header>
    {children}
  </div></main><Footer /></>;
}
