import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';

/** Centered-card shell for guest routes (login, forgot password). */
export function AuthLayout() {
  const { t } = useTranslation();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={2}
      sx={{
        background: (theme) =>
          theme.palette.mode === 'light'
            ? `linear-gradient(160deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
            : `linear-gradient(160deg, ${theme.palette.background.default}, #06110b)`,
      }}
    >
      <Stack spacing={3} alignItems="center" width="100%" maxWidth={420}>
        <Stack direction="row" spacing={1} alignItems="center" color="common.white">
          <VolunteerActivismRoundedIcon fontSize="large" />
          <Typography variant="h6" fontWeight={700}>
            {t('common.appName')}
          </Typography>
        </Stack>
        <Paper elevation={6} sx={{ p: { xs: 3, sm: 4 }, width: '100%', borderRadius: 3 }}>
          <Outlet />
        </Paper>
      </Stack>
    </Box>
  );
}
