import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@components/common';
import type { CasesByTypePoint } from '@types-app/dashboard';

interface CasesByTypeChartProps {
  data: CasesByTypePoint[];
  loading: boolean;
}

/** Beneficiary Cases by Type — horizontal bars so type labels stay readable regardless of
 * length (case-type names are admin-editable free text, e.g. "قرض حسن"). */
export function CasesByTypeChart({ data, loading }: CasesByTypeChartProps) {
  const { t } = useTranslation();
  const nonZero = data.filter((point) => point.count > 0);

  return (
    <Card variant="outlined">
      <CardHeader title={t('dashboard.charts.casesByType')} />
      <CardContent>
        {loading ? (
          <Skeleton variant="rectangular" height={280} />
        ) : nonZero.length === 0 ? (
          <EmptyState description={t('dashboard.charts.noData')} />
        ) : (
          <BarChart
            height={280}
            layout="horizontal"
            yAxis={[{ scaleType: 'band', data: nonZero.map((point) => point.label) }]}
            series={[{ data: nonZero.map((point) => point.count), label: t('cases.fields.caseType') }]}
          />
        )}
      </CardContent>
    </Card>
  );
}
