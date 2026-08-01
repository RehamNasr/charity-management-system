import {
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type IdTokenResult,
  type Unsubscribe,
  type User,
} from 'firebase/auth';
import { auth } from './config';

/**
 * Signs in with email/password. `rememberMe` controls whether the session survives closing the
 * browser (local persistence) or ends with the tab (session persistence) — set on Auth before the
 * credential call so it applies to the resulting session (docs/ARCHITECTURE.md §7: no public
 * self-registration, accounts are provisioned by admins).
 */
export async function signIn(email: string, password: string, rememberMe: boolean): Promise<User> {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export function onAuthStateChangedListener(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/** Custom claims (role) are the Security-Rules source of truth (docs/ARCHITECTURE.md §3/§7). */
export async function getIdTokenResult(user: User, forceRefresh = false): Promise<IdTokenResult> {
  return user.getIdTokenResult(forceRefresh);
}
