import { CheckCircle2, CircleAlert, Info, LoaderCircle, TriangleAlert } from "lucide-react";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      duration={3500}
      visibleToasts={4}
      icons={{
        success: <CheckCircle2 size={18} />,
        error: <CircleAlert size={18} />,
        info: <Info size={18} />,
        warning: <TriangleAlert size={18} />,
        loading: <LoaderCircle className="animate-spin" size={18} />,
      }}
      toastOptions={{
        classNames: {
          toast: "!rounded-2xl !border-[var(--line)] !bg-[var(--surface)] !text-[var(--text)] !shadow-2xl !shadow-black/40",
          description: "!text-[var(--text-dim)]",
          actionButton: "!bg-[var(--accent)] !text-[#18140a]",
          cancelButton: "!bg-white/5 !text-[var(--text)]",
        },
      }}
    />
  );
}
