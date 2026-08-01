import { FirebaseError } from 'firebase/app';

const AUTH_ERROR_MESSAGES_AR: Record<string, string> = {
  'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة.',
  'auth/user-disabled': 'تم تعطيل هذا الحساب. يرجى التواصل مع مسؤول النظام.',
  'auth/user-not-found': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth/wrong-password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth/too-many-requests': 'تم إيقاف تسجيل الدخول مؤقتًا بسبب كثرة المحاولات. حاول لاحقًا.',
  'auth/network-request-failed': 'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.',
  'auth/missing-password': 'يرجى إدخال كلمة المرور.',
};

const DEFAULT_MESSAGE_AR = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';

/** Maps a Firebase Auth error code to a user-facing Arabic message; falls back safely for
 * anything unmapped rather than leaking a raw SDK error string to the UI. */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES_AR[error.code] ?? DEFAULT_MESSAGE_AR;
  }
  return DEFAULT_MESSAGE_AR;
}
