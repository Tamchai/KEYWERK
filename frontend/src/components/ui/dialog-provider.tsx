import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Button } from "./button";
import { DialogContext, type DialogOptions, type DialogResult, type OpenDialog } from "./dialog-context";

interface ActiveDialog {
  options: DialogOptions;
  resolve: (result: DialogResult) => void;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveDialog | null>(null);
  const [value, setValue] = useState("");
  const activeRef = useRef<ActiveDialog | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => () => activeRef.current?.resolve({ confirmed: false, value: "" }), []);

  const openDialog = useCallback<OpenDialog>((options) => {
    activeRef.current?.resolve({ confirmed: false, value: "" });
    setValue(options.input?.defaultValue ?? "");
    return new Promise((resolve) => setActive({ options, resolve }));
  }, []);

  const finish = useCallback((confirmed: boolean) => {
    setActive((current) => {
      current?.resolve({ confirmed, value: confirmed ? value.trim() : "" });
      return null;
    });
  }, [value]);

  const options = active?.options;
  const inputInvalid = Boolean(options?.input?.required && !value.trim());

  return (
    <DialogContext.Provider value={openDialog}>
      {children}
      <AlertDialog.Root open={Boolean(active)} onOpenChange={(open) => { if (!open && active) finish(false); }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[301] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-2xl shadow-black/60">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <AlertTriangle size={21} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <AlertDialog.Title className="text-xl font-semibold tracking-[-0.02em]">
                  {options?.title}
                </AlertDialog.Title>
                {options?.description ? (
                  <AlertDialog.Description className="mt-2 text-sm leading-6 text-[var(--text-dim)]">
                    {options.description}
                  </AlertDialog.Description>
                ) : null}
              </div>
              <AlertDialog.Cancel asChild>
                <button className="rounded-lg p-1.5 text-[var(--text-dim)] transition hover:bg-white/5 hover:text-[var(--text)]" aria-label="ปิด">
                  <X size={18} />
                </button>
              </AlertDialog.Cancel>
            </div>

            {options?.input ? (
              <label className="mb-5 block text-sm font-medium text-[var(--text-dim)]">
                {options.input.label}
                <input
                  autoFocus
                  value={value}
                  placeholder={options.input.placeholder}
                  onChange={(event) => setValue(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-3 text-[var(--text)] outline-none transition placeholder:text-[var(--text-dim)]/60 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
                />
              </label>
            ) : null}

            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">{options?.cancelLabel ?? "ยกเลิก"}</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant={options?.destructive ? "destructive" : "default"}
                  disabled={inputInvalid}
                  onClick={(event) => {
                    if (inputInvalid) {
                      event.preventDefault();
                      return;
                    }
                    finish(true);
                  }}
                >
                  {options?.confirmLabel ?? "ยืนยัน"}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </DialogContext.Provider>
  );
}
