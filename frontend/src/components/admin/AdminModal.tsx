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
  background: "rgba(4,5,3,0.76)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px",
  overflowY: "auto",
  zIndex: 100,
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 620,
  background: "linear-gradient(145deg, var(--surface-top), var(--surface))",
  border: "1px solid rgba(242,194,48,.22)",
  borderRadius: 24,
  padding: 28,
  boxShadow: "0 32px 90px rgba(0,0,0,.62), inset 0 1px rgba(255,255,255,.05)",
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
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontWeight: 800,
              fontSize: 22,
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
              fontFamily: "var(--font-sans)",
              fontSize: 22,
              width: 38,
              height: 38,
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
