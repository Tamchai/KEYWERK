import type { CSSProperties, ReactNode } from "react";

interface AdminModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(10,9,6,0.72)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "60px 20px 40px",
  overflowY: "auto",
  zIndex: 100,
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 560,
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 18px 48px rgba(0,0,0,.5)",
};

export const AdminModal = ({ open, title, onClose, footer, children }: AdminModalProps) => {
  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: 18,
              color: "var(--text)",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="ปิด"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-dim)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 20,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
        {footer && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 20,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
