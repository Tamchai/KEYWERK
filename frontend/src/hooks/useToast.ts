import { useCallback, useRef, useState } from "react";

interface ToastState {
  message: string;
  kind: "error" | "success";
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, kind: "error" | "success" = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, kind });
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  return { toast, showToast };
}
