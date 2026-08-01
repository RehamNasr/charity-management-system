import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@components/common';
import { formatCurrency } from '@utils/formatters';
import type { MonthlyPoint } from '@types-app/dashboard';

interface MonthlyTrendChartProps {
  data: MonthlyPoint[];
  loading: boolean;
}

/** Monthly Donations vs Expenses — last 12 months. */
export function MonthlyTrendChart({ data, loading }: MonthlyTrendChartProps) {
  const { t } = useTranslation();
  const hasData = data.some((point) => point.income > 0 || point.expenses > 0);

  return (
    <Card variant="outlined">
      <CardHeader title={t('dashboard.charts.monthlyTrend')} />
      <CardContent>
        {loading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : !hasData ? (
          <EmptyState description={t('dashboard.charts.noData')} />
        ) : (
          <BarChart
            height={300}
            xAxis={[{ scaleType: 'band', data: data.map((point) => point.label) }]}
            yAxis={[{ valueFormatter: (value: number) => formatCurrency(value) }]}
            series={[
              {
                data: data.map((point) => point.income),
                label: t('reports.income'),
                color: '#2e7d32',
                valueFormatter: (value: number | null) => formatCurrency(value ?? 0),
              },
              {
                data: data.map((point) => point.expenses),
                label: t('reports.expense'),
                color: '#ed6c02',
                valueFormatter: (value: number | null) => formatCurrency(value ?? 0),
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
