import { Component, type ErrorInfo, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { logger } from '@utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** React error boundaries must be class components — there is no hook equivalent for
 * `getDerivedStateFromError`/`componentDidCatch`. Wraps the app (and can be nested per-feature)
 * so a render error in one area doesn't take down the whole page. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Unhandled render error', error, errorInfo.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" px={2}>
            <Stack alignItems="center" spacing={2} textAlign="center" maxWidth={420}>
              <ReportProblemRoundedIcon color="warning" sx={{ fontSize: 56 }} />
              <Typography variant="h6">حدث خطأ غير متوقع</Typography>
              <Typography variant="body2" color="text.secondary">
                نأسف على هذا الإزعاج. يرجى إعادة تحميل الصفحة أو المحاولة لاحقًا.
              </Typography>
              <Button variant="contained" onClick={this.handleReload}>
                إعادة تحميل
              </Button>
            </Stack>
          </Box>
        )
      );
    }

    return this.props.children;
  }
}
