import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { LoadingOverlay } from '@components/common';
import { ROUTES } from '@constants/routes';

/** Gates every authenticated route. Waits for `isInitializing` to resolve before deciding, so a
 * page refresh doesn't briefly flash the login page while Firebase resolves the existing session
 * (docs/ARCHITECTURE.md §7). */
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <LoadingOverlay open />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
