import { create } from 'zustand';
import type { AuthenticatedUser } from '@types-app/user';

interface AuthState {
  user: AuthenticatedUser | null;
  /** True until the first Firebase auth-state callback has fired, so route guards can tell
   * "not signed in" apart from "we don't know yet" and avoid a login-page flash on refresh. */
  isInitializing: boolean;
  setUser: (user: AuthenticatedUser | null) => void;
  setInitialized: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitializing: true,
  setUser: (user) => {
    set({ user });
  },
  setInitialized: () => {
    set({ isInitializing: false });
  },
  clear: () => {
    set({ user: null });
  },
}));
