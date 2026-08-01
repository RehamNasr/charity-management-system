import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { hasAnyRole } from '@utils/permissions';
import { ROUTES } from '@constants/routes';
import type { Role } from '@types-app/user';

interface PermissionGuardProps {
  roles: Role[];
}

/**
 * Role-based route guard — a UX layer only. The real enforcement is Firestore/Storage Security
 * Rules evaluated server-side against the custom-claim role (docs/ARCHITECTURE.md §8); this guard
 * just keeps users from landing on a page they have no data access to in the first place.
 */
export function PermissionGuard({ roles }: PermissionGuardProps) {
  const { role } = useAuth();

  if (!hasAnyRole(role, roles)) {
    return <Navigate to={ROUTES.unauthorized} replace />;
  }

  return <Outlet />;
}
