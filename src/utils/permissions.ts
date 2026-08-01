import type { Role } from '@types-app/user';

/**
 * Client-side role check used for UI decisions (hide/show nav items, disable actions).
 * This is a UX convenience layer only — the real enforcement is Firestore/Storage Security
 * Rules evaluated against the server-trusted custom claim (docs/ARCHITECTURE.md §8).
 */
export function hasAnyRole(userRole: Role | undefined, allowedRoles: Role[] | undefined): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return true;
  return allowedRoles.includes(userRole);
}
