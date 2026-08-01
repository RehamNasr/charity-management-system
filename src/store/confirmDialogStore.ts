import { create } from 'zustand';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface ConfirmDialogState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  resolver: ((confirmed: boolean) => void) | null;
  request: (options: ConfirmOptions) => Promise<boolean>;
  handleClose: (confirmed: boolean) => void;
}

export const useConfirmDialogStore = create<ConfirmDialogState>((set, get) => ({
  isOpen: false,
  options: null,
  resolver: null,
  request: (options) => {
    return new Promise<boolean>((resolve) => {
      set({ isOpen: true, options, resolver: resolve });
    });
  },
  handleClose: (confirmed) => {
    get().resolver?.(confirmed);
    set({ isOpen: false, options: null, resolver: null });
  },
}));
