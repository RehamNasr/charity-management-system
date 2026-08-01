/**
 * Roles are enforced server-side via Firebase custom claims (see docs/ARCHITECTURE.md §3).
 * This union is the client-side mirror used for typing and UI decisions only.
 */
export const ROLES = [
  'super_admin',
  'admin',
  'social_researcher',
  'case_reviewer',
  'financial_officer',
  'data_entry',
  'auditor',
] as const;

export type Role = (typeof ROLES)[number];

export interface RolePermissions {
  role: Role;
  canViewCaseAddress: boolean;
  canViewNationalId: boolean;
  canViewMonthlyIncome: boolean;
  canViewPhoneNumbers: boolean;
  canExportReports: boolean;
  canApproveAssistance: boolean;
  updatedBy: string;
  updatedAt: string;
}

/** Mirrors the `users/{uid}` Firestore document (docs/ARCHITECTURE.md §6). */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  role: Role;
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
