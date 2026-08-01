import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { FormTextField, FormCheckbox } from '@components/form';
import { loginSchema, type LoginFormValues } from '../schemas/authSchemas';
import { login, getRememberedEmail } from '../api/authService';
import { getAuthErrorMessage } from '@utils/firebaseErrors';
import { showSnackbar } from '@store/snackbarStore';
import { ROUTES } from '@constants/routes';

interface LocationState {
  from?: { pathname: string };
}

export function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const rememberedEmail = getRememberedEmail();
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail,
      password: '',
      rememberMe: rememberedEmail.length > 0,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password, values.rememberMe);
      const state = location.state as LocationState | null;
      const redirectTo = state?.from?.pathname ?? ROUTES.dashboard;
      void navigate(redirectTo, { replace: true });
    } catch (error) {
      showSnackbar.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Box component="form" onSubmit={(event) => void onSubmit(event)} noValidate>
      <Stack spacing={2.5}>
        <FormTextField
          name="email"
          control={control}
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          autoFocus
        />
        <FormTextField
          name="password"
          control={control}
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
        />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <FormCheckbox name="rememberMe" control={control} label={t('auth.rememberMe')} />
          <Link component={RouterLink} to={ROUTES.forgotPassword} variant="body2" underline="hover">
            {t('auth.forgotPassword')}
          </Link>
        </Stack>
        <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
          {submitting ? t('auth.loggingIn') : t('auth.loginButton')}
        </Button>
      </Stack>
    </Box>
  );
}
