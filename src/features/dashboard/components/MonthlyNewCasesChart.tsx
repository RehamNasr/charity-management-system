import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@components/common';
import type { MonthlyPoint } from '@types-app/dashboard';

interface MonthlyNewCasesChartProps {
  data: MonthlyPoint[];
  loading: boolean;
}

/** Monthly New Cases — last 12 months (reuses the same month buckets as the trend chart). */
export function MonthlyNewCasesChart({ data, loading }: MonthlyNewCasesChartProps) {
  const { t } = useTranslation();
  const hasData = data.some((point) => point.newCases > 0);

  return (
    <Card variant="outlined">
      <CardHeader title={t('dashboard.charts.monthlyNewCases')} />
      <CardContent>
        {loading ? (
          <Skeleton variant="rectangular" height={280} />
        ) : !hasData ? (
          <EmptyState description={t('dashboard.charts.noData')} />
        ) : (
          <LineChart
            height={280}
            xAxis={[{ scaleType: 'point', data: data.map((point) => point.label) }]}
            series={[
              {
                data: data.map((point) => point.newCases),
                label: t('dashboard.stats.newCases'),
                area: true,
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
