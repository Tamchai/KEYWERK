import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import type { ReactNode } from "react";

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
