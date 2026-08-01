import { docRef, getDocumentOnce } from '@firebase-app/firestore';
import type { UserProfile } from '@types-app/user';

const USERS_COLLECTION = 'users';

/** Fetches the Firestore profile document (display name, etc.) for a signed-in user. */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = docRef<Omit<UserProfile, 'uid'>>(USERS_COLLECTION, uid);
  const data = await getDocumentOnce(ref);
  return data ? { uid, ...data } : null;
}
