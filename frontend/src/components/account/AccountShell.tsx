import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { MapPin, Package, UserRound } from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export default function AccountShell({ title, children }: { title: string; children: ReactNode }) {
  return <><Navbar /><main className="kw-account-shell"><div className="kw-account-frame"><div className="kw-account-heading"><div><p className="kw-eyebrow">MEMBER CONSOLE</p><h1 className="kw-page-title">{title}</h1></div><nav className="kw-account-nav"><NavLink to="/profile"><UserRound size={17} />บัญชี</NavLink><NavLink to="/addresses"><MapPin size={17} />ที่อยู่</NavLink><NavLink to="/orders"><Package size={17} />คำสั่งซื้อ</NavLink></nav></div>{children}</div></main><Footer /></>;
}
