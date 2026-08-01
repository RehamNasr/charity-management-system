import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '@constants/routes';

export function UnauthorizedPage() {
  const { t } = useTranslation();

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" px={2}>
      <Stack alignItems="center" spacing={2} textAlign="center" maxWidth={420}>
        <BlockRoundedIcon sx={{ fontSize: 64 }} color="error" />
        <Typography variant="h5" fontWeight={700}>
          {t('errors.unauthorizedTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('errors.unauthorizedDescription')}
        </Typography>
        <Button component={RouterLink} to={ROUTES.dashboard} variant="contained">
          {t('errors.backToDashboard')}
        </Button>
      </Stack>
    </Box>
  );
}
