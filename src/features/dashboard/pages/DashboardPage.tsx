import { useMemo } from 'react';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import FolderSharedRoundedIcon from '@mui/icons-material/FolderSharedRounded';
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@components/common';
import { useLookupCollection } from '@hooks/useLookupCollection';
import { StatCard } from '../components/StatCard';
import { QuickActions } from '../components/QuickActions';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { MonthlyTrendChart } from '../components/MonthlyTrendChart';
import { CasesByStatusChart } from '../components/CasesByStatusChart';
import { CasesByTypeChart } from '../components/CasesByTypeChart';
import { MonthlyNewCasesChart } from '../components/MonthlyNewCasesChart';
import { useDashboardCollections } from '../hooks/useDashboardCollections';
import {
  computeCasesByStatus,
  computeCasesByType,
  computeDashboardStats,
  computeMonthlyTrend,
  computeRecentActivity,
} from '../api/dashboardService';
import { useAuth } from '@features/auth/hooks/useAuth';
import { formatCurrency } from '@utils/formatters';

/**
 * Realtime dashboard (docs/ARCHITECTURE.md §9/§12). Every KPI card, chart, and activity feed item
 * is a `useMemo` derivation over the four live collections from `useDashboardCollections` — no
 * card triggers its own read, and any Firestore write to cases/visits/donations/expenses updates
 * every card/chart here instantly, with no page refresh, via the underlying `onSnapshot`
 * listeners (see `dashboardService.ts` for why this is a full-collection listen rather than a
 * realtime aggregate query — Firestore's count/sum aggregates can't be listened to).
 */
export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { cases, donations, expenses, recentVisits, loading, error } = useDashboardCollections();
  const caseTypes = useLookupCollection('caseTypes');

  const displayName = user?.profile?.displayName ?? user?.email ?? '';

  const stats = useMemo(
    () => computeDashboardStats(cases, donations, expenses),
    [cases, donations, expenses],
  );
  const monthlyTrend = useMemo(
    () => computeMonthlyTrend(cases, donations, expenses),
    [cases, donations, expenses],
  );
  const casesByStatus = useMemo(() => computeCasesByStatus(cases), [cases]);
  const casesByType = useMemo(
    () => computeCasesByType(cases, caseTypes.data ?? []),
    [cases, caseTypes.data],
  );
  const recentActivity = useMemo(
    () => computeRecentActivity(cases, recentVisits, donations, expenses),
    [cases, recentVisits, donations, expenses],
  );

  return (
    <Stack spacing={3}>
      <PageHeader title={`${t('nav.dashboard')} — ${displayName}`} />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <QuickActions />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard
            label={t('dashboard.stats.totalCases')}
            value={stats.totalCases}
            icon={FolderSharedRoundedIcon}
            loading={loading}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard
            label={t('dashboard.stats.newCases')}
            value={stats.newCasesThisMonth}
            icon={NewReleasesRoundedIcon}
            loading={loading}
            color="secondary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard
            label={t('dashboard.stats.totalDonations')}
            value={formatCurrency(stats.totalDonations)}
            icon={VolunteerActivismRoundedIcon}
            loading={loading}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard
            label={t('dashboard.stats.totalExpenses')}
            value={formatCurrency(stats.totalExpenses)}
            icon={ReceiptLongRoundedIcon}
            loading={loading}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard
            label={t('dashboard.stats.currentBalance')}
            value={formatCurrency(stats.currentBalance)}
            icon={AccountBalanceRoundedIcon}
            loading={loading}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard
            label={t('dashboard.stats.assistedThisMonth')}
            value={stats.beneficiariesAssistedThisMonth}
            icon={FactCheckRoundedIcon}
            loading={loading}
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <MonthlyTrendChart data={monthlyTrend} loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <RecentActivityFeed items={recentActivity} loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CasesByStatusChart data={casesByStatus} loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CasesByTypeChart data={casesByType} loading={loading || caseTypes.loading} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MonthlyNewCasesChart data={monthlyTrend} loading={loading} />
        </Grid>
      </Grid>
    </Stack>
  );
}
