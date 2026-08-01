import { useAuthStore } from '@store/authStore';

interface UseAuthResult {
  user: ReturnType<typeof useAuthStore.getState>['user'];
  isAuthenticated: boolean;
  isInitializing: boolean;
}

/** Read-only view over the auth store for components that just need "who is signed in". Mutating
 * actions (login/logout/reset) live in `authService` and are called directly from the pages/forms
 * that trigger them, since they're one-shot actions rather than state to subscribe to. */
export function useAuth(): UseAuthResult {
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  return {
    user,
    isAuthenticated: user !== null,
    isInitializing,
  };
}
