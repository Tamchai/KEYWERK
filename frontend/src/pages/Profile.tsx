import { useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, Check, LoaderCircle, LogOut, MapPin, Package, Pencil, ShieldCheck, Store, Trash2, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import profileVisual from "../assets/KEYWERK_Preview.png";
import AccountShell from "../components/account/AccountShell";
import { Button } from "../components/ui/button";
import { useConfirmDialog } from "../components/ui/dialog-context";
import { useProfileQuery } from "../hooks/queries/useCommerceQueries";
import { useToast } from "../hooks/useToast";
import { useAuthStore } from "../stores/authStore";
import { resolveImageUrl } from "../utils/image";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function Profile() {
  const email = useAuthStore((state) => state.email);
  const logout = useAuthStore((state) => state.logout);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const { profileQuery, saveProfile, saveProfileImage } = useProfileQuery();
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirmDialog = useConfirmDialog();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const profile = profileQuery.data;
  const displayEmail = profile?.email ?? email ?? "สมาชิก KEYWERK";
  const initial = (profile?.name || displayEmail).trim().charAt(0).toUpperCase() || "K";
  const avatarUrl = resolveImageUrl(profile?.image);

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  const handleImage = (file?: File) => {
    if (!file) return;
    if (!allowedTypes.has(file.type)) return showToast("รองรับเฉพาะไฟล์ JPEG, PNG และ WebP", "error");
    if (file.size > 5 * 1024 * 1024) return showToast("รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB", "error");
    saveProfileImage.mutate(file, {
      onSuccess: () => showToast("เปลี่ยนรูปโปรไฟล์แล้ว"),
      onError: (error) => showToast(error.message, "error"),
    });
  };

  const handleNameSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) return showToast("กรุณากรอกชื่อที่ต้องการแสดง", "error");
    saveProfile.mutate({ name: nextName }, {
      onSuccess: () => { setEditingName(false); showToast("บันทึกชื่อเรียบร้อยแล้ว"); },
      onError: (error) => showToast(error.message, "error"),
    });
  };

  const handleRemoveImage = async () => {
    const confirmed = await confirmDialog({ title: "นำรูปโปรไฟล์ออก", description: "ระบบจะกลับไปแสดงตัวอักษรย่อแทนรูปโปรไฟล์ของคุณ", confirmLabel: "นำรูปออก", destructive: true });
    if (!confirmed) return;
    saveProfile.mutate({ image: "" }, {
      onSuccess: () => showToast("นำรูปโปรไฟล์ออกแล้ว"),
      onError: (error) => showToast(error.message, "error"),
    });
  };

  const handleLogout = async () => {
    const confirmed = await confirmDialog({ title: "ออกจากระบบ", description: "คุณสามารถกลับมาเข้าสู่ระบบและเลือกซื้อสินค้าได้ทุกเมื่อ", confirmLabel: "ออกจากระบบ", destructive: true });
    if (!confirmed) return;
    logout();
    navigate("/");
  };

  return (
    <AccountShell title="โปรไฟล์ของฉัน">
      <div className="kw-profile-grid">
        <section className="kw-profile-card">
          {profileQuery.isLoading ? (
            <div className="flex min-h-80 items-center justify-center gap-3 text-[var(--text-dim)]"><LoaderCircle className="animate-spin" size={22} /> กำลังโหลดโปรไฟล์...</div>
          ) : profileQuery.isError ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-sm text-red-300">{profileQuery.error.message}</div>
          ) : <>
            <div className="kw-profile-identity">
              <div className="group relative shrink-0">
                <button className="kw-profile-avatar overflow-hidden" type="button" onClick={() => fileInputRef.current?.click()} aria-label="เปลี่ยนรูปโปรไฟล์">
                  {avatarUrl ? <img className="h-full w-full object-cover" src={avatarUrl} alt="รูปโปรไฟล์" /> : initial}
                  <span className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"><Camera size={24} /></span>
                </button>
                <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-[var(--surface)] bg-[var(--accent)] text-[#171208]"><Camera size={14} /></span>
                <input ref={fileInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { handleImage(event.target.files?.[0]); event.target.value = ""; }} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="kw-profile-status"><ShieldCheck size={15} /> บัญชีที่ยืนยันแล้ว</span>
                {editingName ? <form className="flex max-w-md items-center gap-2" onSubmit={handleNameSubmit}>
                  <input autoFocus maxLength={120} className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-black/20 px-3 py-2 text-base outline-none focus:border-[var(--accent)]" value={name} onChange={(event) => setName(event.target.value)} />
                  <Button className="h-10 w-10 p-0" type="submit" disabled={saveProfile.isPending} aria-label="บันทึกชื่อ"><Check size={18} /></Button>
                </form> : <div className="flex items-center gap-2"><h2>{profile?.name || "สมาชิก KEYWERK"}</h2><button className="border-0 bg-transparent p-1 text-[var(--text-dim)] hover:text-[var(--accent)]" type="button" onClick={() => setEditingName(true)} aria-label="แก้ไขชื่อ"><Pencil size={16} /></button></div>}
                <p className="truncate">{displayEmail}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-dim)]">
              <button className="inline-flex items-center gap-1.5 border-0 bg-transparent px-2 py-1.5 hover:text-[var(--accent)]" type="button" disabled={saveProfileImage.isPending} onClick={() => fileInputRef.current?.click()}>
                {saveProfileImage.isPending ? <LoaderCircle className="animate-spin" size={14} /> : <Camera size={14} />} {avatarUrl ? "เปลี่ยนรูป" : "เพิ่มรูปโปรไฟล์"}
              </button>
              {avatarUrl ? <button className="inline-flex items-center gap-1.5 border-0 bg-transparent px-2 py-1.5 hover:text-red-300" type="button" onClick={() => void handleRemoveImage()}><Trash2 size={14} /> นำรูปออก</button> : null}
              <span>JPEG, PNG หรือ WebP · สูงสุด 5 MB</span>
            </div>

            <div className="kw-profile-actions">
              <Link to="/addresses"><span className="kw-profile-action-icon"><MapPin size={20} /></span><span><strong>ที่อยู่จัดส่ง</strong><small>เพิ่มหรือแก้ไขข้อมูลผู้รับ</small></span><ArrowRight size={18} /></Link>
              <Link to="/orders"><span className="kw-profile-action-icon"><Package size={20} /></span><span><strong>คำสั่งซื้อของฉัน</strong><small>ตรวจสอบการชำระเงินและสถานะจัดส่ง</small></span><ArrowRight size={18} /></Link>
              {isAdmin ? <Link to="/admin"><span className="kw-profile-action-icon"><Store size={20} /></span><span><strong>จัดการร้านค้า</strong><small>เข้าสู่ระบบควบคุมสำหรับผู้ดูแล</small></span><ArrowRight size={18} /></Link> : null}
            </div>
            <button className="kw-profile-logout" type="button" onClick={() => void handleLogout()}><LogOut size={18} /> ออกจากระบบ</button>
          </>}
        </section>

        <aside className="kw-profile-visual" aria-label="KEYWERK custom keyboard workspace">
          <img src={profileVisual} alt="คีย์บอร์ดคัสตอมจาก KEYWERK" />
          <div className="kw-profile-visual-copy"><span><UserRound size={16} /> MEMBER / KEYWERK</span><strong>YOUR INPUT.<br />YOUR IDENTITY.</strong><p>ทุกคำสั่งซื้อคือชิ้นส่วนหนึ่งของโต๊ะทำงานที่เป็นตัวคุณ</p></div>
        </aside>
      </div>
    </AccountShell>
  );
}

export default Profile;
