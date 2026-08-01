import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { env, firebaseConfig } from './env';
import { logger } from '@utils/logger';

const existingApps = getApps();
const app: FirebaseApp = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Default persistence; the "remember me" toggle on the login form switches this to session-only
// at sign-in time (see features/auth/api/authService.ts).
void setPersistence(auth, browserLocalPersistence).catch((error: unknown) => {
  logger.warn('Failed to set default auth persistence', error);
});

if (env.VITE_USE_FIREBASE_EMULATORS) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  logger.info('Connected to local Firebase Emulator Suite');
}

export { app, auth, db };
