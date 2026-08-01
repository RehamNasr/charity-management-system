import { create } from 'zustand';

/**
 * UI-only notification state (badge count, panel open/closed). The notification *documents*
 * themselves are Firestore data, read live via a hook (docs/ARCHITECTURE.md §6.4/§9) — this
 * store only tracks presentation state derived from that data.
 */
interface NotificationsUiState {
  unreadCount: number;
  panelOpen: boolean;
  setUnreadCount: (count: number) => void;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
}

export const useNotificationsUiStore = create<NotificationsUiState>((set) => ({
  unreadCount: 0,
  panelOpen: false,
  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },
  openPanel: () => {
    set({ panelOpen: true });
  },
  closePanel: () => {
    set({ panelOpen: false });
  },
  togglePanel: () => {
    set((state) => ({ panelOpen: !state.panelOpen }));
  },
}));
