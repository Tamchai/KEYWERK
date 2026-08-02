import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      // หน่วงเล็กน้อยให้ DOM ของหน้าใหม่ render เสร็จก่อน ไม่งั้นหา element ไม่เจอ
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 60);
      return () => clearTimeout(timer);
    } else {
      // ไปหน้าใหม่แบบไม่มี hash — เลื่อนกลับขึ้นบนสุด (SPA ไม่ทำให้อัตโนมัติเหมือนกัน)
      window.scrollTo({ top: 0 });
    }
  }, [hash, pathname]);

  return null;
};

export default ScrollToHash;