import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { ROUTES } from '@constants/routes';

export function ForgotPasswordPage() {
  const { t } = useTranslation();

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={700}>
          {t('auth.forgotPasswordTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('auth.forgotPasswordSubtitle')}
        </Typography>
      </Stack>
      <ForgotPasswordForm />
      <Link
        component={RouterLink}
        to={ROUTES.login}
        variant="body2"
        underline="hover"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}
      >
        <ArrowForwardRoundedIcon fontSize="inherit" />
        {t('auth.backToLogin')}
      </Link>
    </Stack>
  );
}
