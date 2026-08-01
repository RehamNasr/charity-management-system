import type { User } from 'firebase/auth';
import { sendPasswordReset, signIn, signOutUser } from '@firebase-app/auth';
import { STORAGE_KEYS } from '@constants/app';
import { getStorageItem, removeStorageItem, setStorageItem } from '@utils/storage';

export function getRememberedEmail(): string {
  return getStorageItem<string>(STORAGE_KEYS.rememberedEmail, '');
}

/**
 * Signs the user in and persists (or clears) the "remember me" email hint used to pre-fill the
 * login form next time — separate from Firebase's own session persistence (local vs. session),
 * which `signIn` already handles.
 */
export async function login(email: string, password: string, rememberMe: boolean): Promise<User> {
  const user = await signIn(email, password, rememberMe);
  if (rememberMe) {
    setStorageItem(STORAGE_KEYS.rememberedEmail, email);
  } else {
    removeStorageItem(STORAGE_KEYS.rememberedEmail);
  }
  return user;
}

export async function logout(): Promise<void> {
  await signOutUser();
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordReset(email);
}
