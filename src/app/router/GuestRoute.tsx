import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { LoadingOverlay } from '@components/common';
import { ROUTES } from '@constants/routes';

/** Gates guest-only routes (login, forgot-password) — an already-authenticated user is redirected
 * straight to the dashboard instead of seeing the login form again. */
export function GuestRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingOverlay open />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}
