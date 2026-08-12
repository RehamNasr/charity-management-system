import { useEffect, useState } from 'react';
import { getCountFromServer, getDocs, where } from 'firebase/firestore';
import { collectionRef, withSoftDeleteFilter } from '@firebase-app/firestore';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import { useTranslation } from 'react-i18next';
import { buildDonationsInRangeQuery } from '@features/donations/api/donationService';
import { buildExpensesInRangeQuery } from '@features/expenses/api/expenseService';
import { exportRowsToExcel, exportRowsToPdf, type ExportColumn } from '@utils/export';
import { formatCurrency } from '@utils/formatters';
import type { Case } from '@types-app/case';

interface PeriodSummary {
  totalIncome: number;
  totalExpenses: number;
  newCasesCount: number;
}

async function fetchPeriodSummary(start: Date, end: Date): Promise<PeriodSummary> {
  const [donationsSnap, expensesSnap, casesCountSnap] = await Promise.all([
    getDocs(buildDonationsInRangeQuery(start, end)),
    getDocs(buildExpensesInRangeQuery(start, end)),
    getCountFromServer(
      withSoftDeleteFilter(
        collectionRef<Case>('cases'),
        where('createdAt', '>=', start),
        where('createdAt', '<=', end),
      ),
    ),
  ]);

  return {
    totalIncome: donationsSnap.docs.reduce((sum, d) => sum + (d.data().amount ?? 0), 0),
    totalExpenses: expensesSnap.docs.reduce((sum, d) => sum + (d.data().amount ?? 0), 0),
    newCasesCount: casesCountSnap.data().count,
  };
}

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function MonthlyReportTab() {
  const { t } = useTranslation();
  const [month, setMonth] = useState(currentMonthValue());
  const [summary, setSummary] = useState<PeriodSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        if (!month) return;
        const [year, monthIndex] = month.split('-').map(Number);
        const start = new Date(year, monthIndex - 1, 1);
        const end = new Date(year, monthIndex, 0, 23, 59, 59, 999);

        const result = await fetchPeriodSummary(start, end);
        if (!cancelled) {
          setSummary(result);
        }
      } catch (err) {
        console.error('Error fetching monthly summary:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [month]);

  const rows = summary ? [summary] : [];
  const exportColumns: ExportColumn<PeriodSummary>[] = [
    { header: t('reports.income'), value: (r) => r.totalIncome },
    { header: t('reports.expense'), value: (r) => r.totalExpenses },
    { header: t('reports.balance'), value: (r) => r.totalIncome - r.totalExpenses },
    { header: t('dashboard.stats.newCases'), value: (r) => r.newCasesCount },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
        <TextField
          type="month"
          size="small"
          label={t('reports.selectMonth')}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<DownloadRoundedIcon />}
            disabled={!summary}
            onClick={() => void exportRowsToExcel(rows, exportColumns, `monthly-report-${month}`)}
          >
            {t('reports.exportExcel')}
          </Button>
          <Button
            size="small"
            startIcon={<PictureAsPdfRoundedIcon />}
            disabled={!summary}
            onClick={() =>
              void exportRowsToPdf(rows, exportColumns, `monthly-report-${month}`, t('reports.tabs.monthly'))
            }
          >
            {t('reports.exportPdf')}
          </Button>
        </Stack>
      </Stack>

      {loading || !summary ? null : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {t('reports.income')}
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {formatCurrency(summary.totalIncome)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {t('reports.expense')}
                </Typography>
                <Typography variant="h6" color="warning.main" fontWeight="bold">
                  {formatCurrency(summary.totalExpenses)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {t('reports.balance')}
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(summary.totalIncome - summary.totalExpenses)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.stats.newCases')}: <strong>{summary.newCasesCount}</strong>
            </Typography>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
