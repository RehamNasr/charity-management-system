import { create } from 'zustand';
import { STORAGE_KEYS } from '@constants/app';
import { getStorageItem, setStorageItem } from '@utils/storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: getStorageItem<ThemeMode>(STORAGE_KEYS.themeMode, 'light'),
  toggleMode: () => {
    const next: ThemeMode = get().mode === 'light' ? 'dark' : 'light';
    setStorageItem(STORAGE_KEYS.themeMode, next);
    set({ mode: next });
  },
  setMode: (mode) => {
    setStorageItem(STORAGE_KEYS.themeMode, mode);
    set({ mode });
  },
}));
