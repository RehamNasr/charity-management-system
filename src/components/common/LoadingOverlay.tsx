import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';

interface LoadingOverlayProps {
  open: boolean;
  label?: string;
}

/** Full-screen blocking loader for app-level bootstrap (e.g. waiting on the first auth-state
 * callback), as opposed to `LoadingSpinner`, which is scoped inline to a section. */
export function LoadingOverlay({ open, label }: LoadingOverlayProps) {
  const { t } = useTranslation();

  return (
    <Backdrop
      open={open}
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 10,
        backgroundColor: 'background.default',
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <CircularProgress color="primary" />
        <Typography color="text.primary" variant="body2">
          {label ?? t('common.loading')}
        </Typography>
      </Stack>
    </Backdrop>
  );
}
