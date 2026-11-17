import { z } from 'zod';

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyCeW13cWKoF3SrYZM8ei6Zq0CnftPolU_o',
  authDomain: 'charity-management-syste-11ede.firebaseapp.com',
  projectId: 'charity-management-syste-11ede',
  storageBucket: 'charity-management-syste-11ede.firebasestorage.app',
  messagingSenderId: '205571423291',
  appId: '1:205571423291:web:0ebb0a1824202866b2701e',
  measurementId: 'G-REN6JH0VC2',
};

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val : defaultFirebaseConfig.apiKey)),
  VITE_FIREBASE_AUTH_DOMAIN: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val : defaultFirebaseConfig.authDomain)),
  VITE_FIREBASE_PROJECT_ID: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val : defaultFirebaseConfig.projectId)),
  VITE_FIREBASE_STORAGE_BUCKET: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val : defaultFirebaseConfig.storageBucket)),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val : defaultFirebaseConfig.messagingSenderId)),
  VITE_FIREBASE_APP_ID: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val : defaultFirebaseConfig.appId)),
  VITE_FIREBASE_MEASUREMENT_ID: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val : defaultFirebaseConfig.measurementId)),
  VITE_USE_FIREBASE_EMULATORS: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
});

function parseEnv() {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `  - ${issue.message}`).join('\n');
    throw new Error(
      `Missing or invalid Firebase environment configuration.\n${issues}\n` +
        'Copy .env.example to .env and fill in your Firebase project settings.',
    );
  }
  return result.data;
}

export const env = parseEnv();

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  ...(env.VITE_FIREBASE_MEASUREMENT_ID ? { measurementId: env.VITE_FIREBASE_MEASUREMENT_ID } : {}),
};
