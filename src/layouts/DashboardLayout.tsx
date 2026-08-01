import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AppBreadcrumbs, ErrorBoundary } from '@components/common';
import { SIDEBAR_NAV_ITEMS } from '@constants/navigation';
import { ROUTES } from '@constants/routes';
import type { BreadcrumbItem } from '@types-app/common';

function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();

  return useMemo(() => {
    const items: BreadcrumbItem[] = [{ labelKey: 'nav.dashboard', path: ROUTES.dashboard }];

    const matched = SIDEBAR_NAV_ITEMS.find(
      (item) => item.path !== ROUTES.dashboard && location.pathname.startsWith(item.path),
    );

    if (matched) {
      items.push({ labelKey: matched.labelKey });
    }

    return items;
  }, [location.pathname]);
}

/** Shell for every authenticated route: sidebar + topbar + breadcrumbs + content, wrapped in a
 * page-level error boundary so one broken feature page doesn't take down the whole shell. */
export function DashboardLayout() {
  const breadcrumbs = useBreadcrumbs();

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar />
      <Box component="main" flex={1} display="flex" flexDirection="column" minWidth={0}>
        <Topbar />
        <Container maxWidth="xl" sx={{ py: 3, flex: 1 }}>
          <AppBreadcrumbs items={breadcrumbs} />
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Container>
      </Box>
    </Box>
  );
}
