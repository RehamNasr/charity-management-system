import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { FormTextField } from '@components/form';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/authSchemas';
import { requestPasswordReset } from '../api/authService';
import { getAuthErrorMessage } from '@utils/firebaseErrors';
import { showSnackbar } from '@store/snackbarStore';
import { FirebaseError } from 'firebase/app';

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      // Firebase intentionally does not reveal whether the email exists — the same success
      // message is shown either way, so this flow can't be used to enumerate staff accounts.
      await requestPasswordReset(values.email);
      setSent(true);
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
        setSent(true);
      } else {
        showSnackbar.error(getAuthErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  });

  if (sent) {
    return <Alert severity="success">{t('auth.resetLinkSent')}</Alert>;
  }

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
        <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
          {submitting ? t('auth.sendingResetLink') : t('auth.sendResetLink')}
        </Button>
      </Stack>
    </Box>
  );
}
