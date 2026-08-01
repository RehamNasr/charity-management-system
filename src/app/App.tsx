import { useMemo } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { router } from './router/routes';
import { createAppTheme } from '@theme/index';
import { createRtlCache } from '@theme/rtlCache';
import { useThemeStore } from '@store/themeStore';
import { ErrorBoundary, ConfirmDialog } from '@components/common';
import { SnackbarHost } from '@components/feedback/SnackbarHost';
import '@locales/i18n';

const rtlCache = createRtlCache();

export function App() {
  const mode = useThemeStore((state) => state.mode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
          <ConfirmDialog />
          <SnackbarHost />
        </ErrorBoundary>
      </ThemeProvider>
    </CacheProvider>
  );
}
