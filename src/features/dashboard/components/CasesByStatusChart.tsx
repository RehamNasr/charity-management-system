import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import { PieChart } from '@mui/x-charts/PieChart';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@components/common';
import { CASE_STATUS_COLORS } from '@constants/caseStatus';
import type { CasesByStatusPoint } from '@types-app/dashboard';

const MUI_COLOR_HEX: Record<string, string> = {
  default: '#9e9e9e',
  info: '#0288d1',
  warning: '#ed6c02',
  success: '#2e7d32',
  error: '#d32f2f',
  primary: '#1976d2',
};

interface CasesByStatusChartProps {
  data: CasesByStatusPoint[];
  loading: boolean;
}

/** Beneficiary Cases by Status. */
export function CasesByStatusChart({ data, loading }: CasesByStatusChartProps) {
  const { t } = useTranslation();
  const nonZero = data.filter((point) => point.count > 0);

  return (
    <Card variant="outlined">
      <CardHeader title={t('dashboard.charts.casesByStatus')} />
      <CardContent>
        {loading ? (
          <Skeleton variant="rectangular" height={280} />
        ) : nonZero.length === 0 ? (
          <EmptyState description={t('dashboard.charts.noData')} />
        ) : (
          <PieChart
            height={280}
            series={[
              {
                data: nonZero.map((point) => ({
                  id: point.status,
                  value: point.count,
                  label: point.label,
                  color: MUI_COLOR_HEX[CASE_STATUS_COLORS[point.status]],
                })),
                innerRadius: 40,
                paddingAngle: 2,
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
