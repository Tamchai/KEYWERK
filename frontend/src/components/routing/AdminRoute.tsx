import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import type { ReactNode } from "react";

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const location = useLocation();

  if (!hasHydrated) {
    return <p style={{ padding: 32 }}>กำลังตรวจสอบสิทธิ์...</p>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
