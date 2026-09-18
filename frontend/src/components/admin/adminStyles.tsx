import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
}

export const AdminPageShell = ({ children }: PageShellProps) => (
  <div className="admin-page-shell">{children}</div>
);
