import { create } from 'zustand';
import { STORAGE_KEYS } from '@constants/app';
import { getStorageItem, setStorageItem } from '@utils/storage';

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  collapsed: getStorageItem<boolean>(STORAGE_KEYS.sidebarCollapsed, false),
  mobileOpen: false,
  toggleCollapsed: () => {
    const next = !get().collapsed;
    setStorageItem(STORAGE_KEYS.sidebarCollapsed, next);
    set({ collapsed: next });
  },
  openMobile: () => {
    set({ mobileOpen: true });
  },
  closeMobile: () => {
    set({ mobileOpen: false });
  },
}));
