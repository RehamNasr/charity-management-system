import { useEffect, type ReactNode } from 'react';
import { getIdTokenResult, onAuthStateChangedListener } from '@firebase-app/auth';
import { fetchUserProfile } from '@services/user.service';
import { useAuthStore } from '@store/authStore';
import { showSnackbar } from '@store/snackbarStore';
import { logger } from '@utils/logger';

interface AuthProviderProps {
  children: ReactNode;
}

/** Bounds how long the auth bootstrap will wait on Firestore before giving up and treating the
 * profile as unavailable. Without this, an unreachable/misconfigured Firestore backend (wrong
 * project, database not provisioned, security rules misconfigured) leaves `isInitializing` stuck
 * `true` forever — the user never gets past the login screen and never sees an error, since
 * nothing ever settles. Login itself (Firebase Auth) still succeeds; only the profile/role lookup
 * is time-boxed. */
const PROFILE_FETCH_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timed out after ${String(ms)}ms`));
      }, ms);
    }),
  ]);
}

/**
 * Bootstraps the auth session: listens for Firebase auth-state changes, resolves the custom-claim
 * role via the ID token, loads the matching Firestore `users/{uid}` profile, and mirrors all of it
 * into `authStore`. Route guards key off `authStore.isInitializing` to avoid a login-page flash
 * while this first resolves (docs/ARCHITECTURE.md §7/§9).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((firebaseUser) => {
      void (async () => {
        if (!firebaseUser) {
          clear();
          setInitialized();
          return;
        }

        try {
          const [profile] = await withTimeout(
            Promise.all([fetchUserProfile(firebaseUser.uid), getIdTokenResult(firebaseUser)]),
            PROFILE_FETCH_TIMEOUT_MS,
          );

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            profile,
          });
        } catch (error) {
          logger.error('Failed to resolve authenticated user profile', error);
          // A signed-in user with no resolvable profile has no role, so every role-gated nav
          // item/route is invisible to them (working as designed — see PermissionGuard/Sidebar).
          // That's silent and confusing on its own, so surface it explicitly here rather than
          // leaving the user to wonder why most of the app is missing.
          showSnackbar.error(
            'تعذر تحميل بيانات المستخدم. تحقق من إعداد قاعدة البيانات أو تواصل مع مسؤول النظام.',
          );
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            profile: null,
          });
        } finally {
          setInitialized();
        }
      })();
    });

    return unsubscribe;
  }, [setUser, setInitialized, clear]);

  return children;
}
