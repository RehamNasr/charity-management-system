/** Mirrors the `users/{uid}` Firestore document (docs/ARCHITECTURE.md §6). */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  createdBy: string;
  lastLoginAt?: string;
}

/** The authenticated user as consumed throughout the app: Firebase identity + Firestore profile. */
export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  profile: UserProfile | null;
}
