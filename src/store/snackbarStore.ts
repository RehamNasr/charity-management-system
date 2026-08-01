import { create } from 'zustand';
import type { AlertColor } from '@mui/material/Alert';

export interface SnackbarMessage {
  id: string;
  message: string;
  severity: AlertColor;
  autoHideDuration: number | null;
}

interface SnackbarState {
  queue: SnackbarMessage[];
  enqueue: (message: string, severity?: AlertColor, autoHideDuration?: number | null) => void;
  dismiss: (id: string) => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  queue: [],
  enqueue: (message, severity = 'info', autoHideDuration = 5000) => {
    const id = crypto.randomUUID();
    set((state) => ({
      queue: [...state.queue, { id, message, severity, autoHideDuration }],
    }));
  },
  dismiss: (id) => {
    set((state) => ({ queue: state.queue.filter((item) => item.id !== id) }));
  },
}));

/** Convenience API used throughout the app: `showSnackbar.success('تم الحفظ بنجاح')`. */
export const showSnackbar = {
  success: (message: string) => {
    useSnackbarStore.getState().enqueue(message, 'success');
  },
  error: (message: string) => {
    useSnackbarStore.getState().enqueue(message, 'error');
  },
  warning: (message: string) => {
    useSnackbarStore.getState().enqueue(message, 'warning');
  },
  info: (message: string) => {
    useSnackbarStore.getState().enqueue(message, 'info');
  },
};
