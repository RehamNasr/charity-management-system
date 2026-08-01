import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const { t } = useTranslation();

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={700}>
          {t('auth.loginTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('auth.loginSubtitle')}
        </Typography>
      </Stack>
      <LoginForm />
      <Typography variant="caption" color="text.secondary" textAlign="center">
        {t('auth.noSelfRegistration')}
      </Typography>
    </Stack>
  );
}
