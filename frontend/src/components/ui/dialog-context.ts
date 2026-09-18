import { createContext, useCallback, useContext } from "react";

export interface DialogOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  input?: {
    label: string;
    defaultValue?: string;
    placeholder?: string;
    required?: boolean;
  };
}

export interface DialogResult {
  confirmed: boolean;
  value: string;
}

export type OpenDialog = (options: DialogOptions) => Promise<DialogResult>;

export const DialogContext = createContext<OpenDialog | null>(null);

function useOpenDialog() {
  const openDialog = useContext(DialogContext);
  if (!openDialog) throw new Error("Dialog hooks must be used inside DialogProvider");
  return openDialog;
}

export function useConfirmDialog() {
  const openDialog = useOpenDialog();
  return useCallback(async (options: DialogOptions) => {
    const result = await openDialog(options);
    return result.confirmed;
  }, [openDialog]);
}

export function usePromptDialog() {
  const openDialog = useOpenDialog();
  return useCallback(async (options: DialogOptions & { input: NonNullable<DialogOptions["input"]> }) => {
    const result = await openDialog(options);
    return result.confirmed ? result.value : null;
  }, [openDialog]);
}
