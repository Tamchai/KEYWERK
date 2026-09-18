import { useCallback } from "react";
import { toast } from "sonner";

export function useToast() {
  const showToast = useCallback((message: string, kind: "error" | "success" = "success") => {
    toast[kind](message);
  }, []);

  return { showToast };
}
