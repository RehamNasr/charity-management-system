import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FolderSharedRoundedIcon from '@mui/icons-material/FolderSharedRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import { useTranslation } from 'react-i18next';
import { PageHeader, EmptyState } from '@components/common';
import { StatCard } from '../components/StatCard';
import { useAuth } from '@features/auth/hooks/useAuth';
import { ROLE_LABELS_AR } from '@constants/roles';

/**
 * Dashboard shell only (docs/ARCHITECTURE.md §9/§12 Phase 11) — stat tiles, activity feed, and
 * chart panels render in their final layout with empty/loading states; each is wired to real
 * Firestore rollups once its owning business module ships.
 */
export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const displayName = user?.profile?.displayName ?? user?.email ?? '';
  const roleLabel = user?.profile ? ROLE_LABELS_AR[user.profile.role] : '';

  return (
    <Stack spacing={3}>
      <PageHeader title={`${t('nav.dashboard')} — ${displayName}`} description={roleLabel} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label={t('nav.cases')} icon={FolderSharedRoundedIcon} loading color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={t('nav.assistance')}
            icon={FactCheckRoundedIcon}
            loading
            color="secondary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={t('nav.donations')}
            icon={VolunteerActivismRoundedIcon}
            loading
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={t('nav.financial')}
            icon={AccountBalanceRoundedIcon}
            loading
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title={t('nav.dashboard') + ' — ' + t('common.appName')}
              subheader="Monthly Trend"
            />
            <CardContent>
              <EmptyState description={t('common.comingSoonDescription')} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader title="Activity Feed" />
            <CardContent>
              <EmptyState description={t('common.comingSoonDescription')} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader title="Top Governorates" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {t('common.comingSoonDescription')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader title="Cases by Status" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {t('common.comingSoonDescription')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader title="Most Common Assistance Types" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {t('common.comingSoonDescription')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
